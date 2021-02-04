const chain = require('~utils/chain');
const jwt = require('~utils/jwt');
const customerService = require('~services/customer.service');
const adminService = require('~services/admin.service');
const roleService = require('~services/role.service');

function getTokenFromHeader(req) {

  let token = req.headers['authorization'] || req.headers['x-access-token'];

  if (!token) {
    throw new AuthenticationException({ message: 'Access token not provided' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  return token;
}

function decodeToken(token) {
  try {
    return jwt.verifyAccessToken(token);

  } catch (e) {
    throw new AuthenticationException({ message: _.upperFirst(e.message) });
  }
}

async function getProfile(account, id) {

  const service = account === 'customer' ? customerService : adminService;

  return await service.findById(id, ['_id', 'tokenVersion', 'roles']);
}

function checkTokenVersion(profile, tokenVersion) {
  
  return profile.tokenVersion == tokenVersion;
}

function hasPermission(expect, permission) {
  
  const [resource, action] = expect.trim().split('.');

  if (permission[resource] == action || permission[resource].includes(action)) {
    return true;
  }

  return false;
}

module.exports = chain({

  auth: async function (account) {

    if (!['customer', 'admin'].includes(account)) {
      throw Error(`Auth middleware with wrong argument '${account}'`);
    }

    return async function (req, _res, next) {
      
      const token = getTokenFromHeader(req);
      const decodedToken = decodeToken(token);

      if (decodedToken.type !== account) return next(
        new AuthenticationException({ message: 'Cannot use this token' })
      );

      const profile = await getProfile(account, decodedToken.id);
      const check = checkTokenVersion(profile, decodedToken.version);

      if (!check) return next(
        new AuthenticationException({ message: 'Cannot use this token' })
      );

      req.user = _.assign(req.user || {}, _.pick(profile.toJSON(), ['_id', 'roles']));

      req.user.type = account;

      return next();
    }
  },

  ownerId: function (from) {
    
    return function (req, _res, next) {

      const expectId = _.get(req, from);
      const userId = _.get(req.user, '_id');

      if (expectId !== userId) {
        return next(
          new AuthorizationException({ message: 'Don\'t have permission to access' })
        )
      }
      
      return next();
    }
  },

  roles: function (...expectedRoles) {

    return function (req, _res, next) {

      const { roles } = req.user;

      for (const expect of expectedRoles) {

        if (Array.isArray(expect)) {

          if (!_.intersection(roles, expect).length) {
            throw new AuthorizationException({ message: 'Must be one of "' + expect.join(', ') + '" to access' });
          }

        } else {

          if (!roles.includes(expect)) {
            throw new AuthorizationException({ message: 'Must be "' + expect + '" to access' });
          }
        }
      }

      return next();
    }
  },
  
  can: function (...actions) {

    return async function (req, _res, next) {
      
      const { roles } = req.user;

      const permission = await roleService.cache.getAllPermission(...roles);

      for (const expect of actions) {

        if (Array.isArray(expect)) {

          if (!expect.find(e => hasPermission(e, permission))) {
            throw new AuthorizationException({ message: 'Don\'t have permission to access' });
          }

        } else {

          if (!hasPermission(expect, permission)) {
            throw new AuthorizationException({ message: 'Don\'t have permission to access' });
          }

        }
      }

      return next();
    }
  }
});
