const chain = require('~utils/chain');
const jwt = require('~utils/jwt');
const _ = require('lodash');
const userService = require('~services/user.service');
const adminService = require('~services/admin.service');
const { AuthenticationException, AuthorizationException } = require('~exceptions');

function getTokenFromHeader(req) {
  const token = req.headers['authorization'] || req.headers['x-access-token'];

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
    throw new AuthenticationException({ message: e.message });
  }
}

async function getProfile(accountType, id) {

  const service = accountType === 'user' ? userService : adminService;

  return await service.findById(id, ['_id', 'tokenVersion', 'roles']);
}

function checkTokenVersion(profile, tokenVersion) {
  
  return profile.tokenVersion == tokenVersion;
}

module.exports = chain({

  auth: function (accountType) {

    if (!['user', 'admin'].includes(accountType)) {
      throw Error(`Auth middleware with wrong argument '${accountType}'`);
    }

    this.context.accountType = accountType;

    return async function (req, _res, next) {
      
      const token = getTokenFromHeader(req);
      const decodedToken = decodeToken(token);
      const profile = await getProfile(accountType, decodedToken.id);
      const check = checkTokenVersion(profile, decodedToken.version);

      if (!check) {
        return next(
          new AuthenticationException({ message: 'Cannot use this token' })
        );
      }

      req[accountType] = _.assign(req[accountType] || {}, _.pick(profile.toJSON(), ['_id', 'roles']));
      
      return next();
    }
  },

  ownerId: function (from) {

    return function (req, _res, next) {

      const reqId = _.get(req, from);
      const authId = _.get(req, [this.context.accountType, '_id']);

      if (reqId != authId) {
        return next(
          new AuthorizationException({ message: 'Don\'t have permission to access' })
        )
      }
      
      return next();
    }
  }
});
