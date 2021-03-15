const chain = require('~utils/chain');
const jwt = require('~utils/jwt');
const customerService = require('~services/customer.service');
const adminService = require('~services/admin.service');
const roleService = require('~services/role.service');

function _getTokenFromHeader(req) {
  let token = req.headers['authorization'] || req.headers['x-access-token'];

  if (!token) {
    throw new AuthenticationException({
      code: 'MISSING_ACCESS_TOKEN',
      message: 'Access token not provided'
    });
  }

  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.substring(7);
  }

  return token;
}

function _decodeToken(token) {
  try {
    return jwt.verifyAccessToken(token);

  } catch (e) {
    throw new AuthenticationException({ message: _.upperFirst(e.message) });
  }
}

async function _getProfile(account, id, fields) {
  const service = account === 'customer' ? customerService : adminService;

  return await service.findById(id, ['_id', 'tokenVersion', 'roles'].concat(fields || []));
}

function _checkTokenVersion(profile, tokenVersion) {
  return profile.tokenVersion == tokenVersion;
}

function _assignUserToRequest(req, account, profile, fields) {
  profile = _.pick(profile, ['_id', 'roles'].concat(fields));
  
  req.user = _.assign(req.user || {}, { type: account, ...profile });
}

function _hasPermission(expect, permission) {
  const [resource, action] = expect.trim().split('.');

  return permission[resource] == action 
    || permission[resource].includes(action);
}

function _auth(account) {
  if (!['customer', 'admin'].includes(account)) {
    throw Error(`Auth middleware with wrong argument '${account}'`);
  }

  return async function (req, _res, next) {

    const token = _getTokenFromHeader(req);
    const decodedToken = _decodeToken(token);

    if (decodedToken.type !== account) return next(
      new AuthenticationException({ message: 'Cannot use this token' })
    );

    const fields = this.context.getFields;
    const profile = await _getProfile(account, decodedToken.id, fields);

    const check = _checkTokenVersion(profile, decodedToken.version);

    if (!check) return next(
      new AuthenticationException({
        code: 'CREDENTIALS_HAVE_CHANGED',
        message: 'Cannot use this token'
      })
    );

    _assignUserToRequest(req, account, profile, fields);
    return next();
  }
}

function _getProfileFields(...fields) {
  this.context.getFields = fields;

  return function (_req, _res, next) {
    return next();
  }
}

function _isOwnerId(from) {
  return function (req, _res, next) {

    const expectId = ObjectId(_.get(req, from));
    const userId = ObjectId(_.get(req.user, '_id'));

    if (!expectId.equals(userId)) {
      return next(
        new AuthorizationException({ 
          message: 'You are not owner of this resource' 
        })
      );
    }

    return next();
  }
}

function _hasRoles(...expectedRoles) {
  return function (req, _res, next) {

    const { roles } = req.user;

    for (const expect of expectedRoles) {
      if (Array.isArray(expect)) {

        if (!_.intersection(roles, expect).length) {
          return next(
            new AuthorizationException({ 
              message: 'Must be one of "' + expect.join(', ') + '" to access' 
            })
          );
        }

      } else {

        if (!roles.includes(expect)) {
          return next(
            new AuthorizationException({ 
              message: 'Must be "' + expect + '" to access' 
            })
          );
        }
      }
    }

    return next();
  }
}

function _canDoAction(...actions) {
  return async function (req, _res, next) {

    const { roles } = req.user;
    const permission = await roleService.getPermissionByRoleNames(...roles);

    for (const expect of actions) {
      if (Array.isArray(expect)) {

        if (!expect.find(e => _hasPermission(e, permission))) {
          return next(
            new AuthorizationException({ 
              message: 'Don\'t have permission to access' 
            })
          );
        }

      } else {

        if (!_hasPermission(expect, permission)) {
          return next(
            new AuthorizationException({ 
              message: 'Don\'t have permission to access'
            })
          );
        }
      }
    }

    return next();
  }
}

module.exports = chain(_auth, { get: _getProfileFields, ownerId: _isOwnerId, roles: _hasRoles, can: _canDoAction });
