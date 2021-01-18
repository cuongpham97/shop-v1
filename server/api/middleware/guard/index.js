const { AuthenticationException, AuthorizationException } = require('~exceptions');
const jwt = require('~utils/jwt');
const _ = require('lodash');

const auth = {
  getTokenFromHeader: function (req) {
    const token = req.headers['authorization'] || req.headers['x-access-token'];

    if (!token) {
      throw new AuthenticationException({ message: 'Access token not provided' });
    }

    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    return token;
  },

  decodeToken: function (token) {
    try {
      return jwt.verifyAccessToken(token);
  
    } catch (e) {
      throw new AuthenticationException({ message: e.message });
    }
  },

  permissionExpected: function () {
    return { id: null, role: [], can: [] };
  },

  checkPermission: function (expected, decodedToken, req) {

    // Check id
    const id = _.get(req, expected.id);
    
    if (id != decodedToken.id) return false;

    // Check role
    

    // Check action

    return true;
  },

  middlewareChain: function (expected) {
    return {
      ownerId: function (from = '') {
        expected.id = from;
        return this;
      },

      role: function (...role) {
        expected.role = expected.role.concat(role);
        return this;
      },

      can: function (...can) {
        expected.can = expected.can.concat(can);
        return this;
      }
    };
  },

  createMiddleware: function (accountType) {
    const self = this;

    const expected = self.permissionExpected();

    const middleware = function (req, _res, next) {
      
      const token = self.getTokenFromHeader(req);
      const decodedToken = self.decodeToken(token);

      req[accountType] = Object.assign(req[accountType] || {}, decodedToken);

      const check = self.checkPermission(expected, decodedToken, req);

      if (check) return next();

      return next(
        new AuthorizationException({ message: 'You don\'t have permission to access' })
      );
    }

    return Object.assign(middleware, self.middlewareChain(expected));
  }
}

module.exports = {
  auth: function (accountType) {

    if (!['user', 'admin'].includes(accountType)) {
      throw Error(`Auth middleware with wrong argument '${accountType}'`);
    }

    return auth.createMiddleware(accountType);
  }
};
