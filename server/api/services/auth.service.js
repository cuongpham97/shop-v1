const roleService = require('~services/role.service');
const validate = require('~utils/validate');
const config = require('~config');
const jwt = require('~utils/jwt');
const { regexes } = require('~utils/constants');
const { mongodb } = require('~database');
const Customer = mongodb.model('customer');
const Admin = mongodb.model('admin');

async function _parseCredentials(basicHeader) {
  if (!basicHeader) {
    throw new AuthenticationException({ 
      code: 'INVALID_CREDENTIALS',
      message: 'Missing basic authentication header' 
    });
  }

  if (basicHeader.toLowerCase().startsWith('basic ')) {
    basicHeader = basicHeader.substring(6);
  }

  const buffer = Buffer.from(basicHeader, 'base64');
  const credentials = buffer.toString('ascii').split(':');

  const [username, password] = credentials;
  const validation = await validate({ username, password }, {
    'username': 'required|string|min:6|max:100|lowercase',
    'password': 'required|string|min:6|max:16'
  });

  if (validation.errors) {
    throw new AuthenticationException({
      code: 'INVALID_CREDENTIALS',
      message: 'Username or password is incorrect' 
    });
  }

  return validation.result;
}

async function _getCustomerTokens(username, password) {
  const phoneOrEmail = regexes.PHONE_NUMBER.test(username) ? 'phone' : 'email';

  const customer = await Customer.findOne({
    [`local.${phoneOrEmail}`]: username
  });

  if (!customer || !await customer.comparePassword(password)) {
    throw new AuthenticationException({ 
      code: 'INVALID_CREDENTIALS',
      message: 'Username or password is incorrect' 
    });
  }

  if (!customer.active) {
    throw new AuthenticationException({
      code: 'ACCOUNT_UNAVAILABLE',
      message: 'This account has been deactivated'
    });
  }

  return {
    name: customer.displayName,
    avatar: (customer.avatar && customer.avatar.url) || null,

    accessToken: jwt.createAccessToken({
      type: 'customer',
      id: customer._id,
      version: customer.tokenVersion
    }),

    refreshToken: jwt.createRefreshToken({
      type: 'customer',
      id: customer._id,
      version: customer.tokenVersion
    }),

    expiresIn: config.jwt.ACCESS_TOKEN_LIFE
  };
}

async function _getAdminTokens(username, password) {
  const admin = await Admin.findOne({ username });

  if (!admin || !await admin.comparePassword(password)) {
    throw new AuthenticationException({ 
      code: 'INVALID_CREDENTIALS',
      message: 'Username or password is incorrect' 
    });
  }

  if (!admin.active) {
    throw new AuthenticationException({
      code: 'ACCOUNT_UNAVAILABLE',
      message: 'This account has been deactived'
    });
  } 

  return {
    name: admin.displayName,
    avatar: (admin.avatar && admin.avatar.url) || null,

    accessToken: jwt.createAccessToken({
      type: 'admin',
      id: admin._id,
      version: admin.tokenVersion
    }),

    refreshToken: jwt.createRefreshToken({
      type: 'admin',
      id: admin._id,
      version: admin.tokenVersion
    }),

    scopes: await roleService.getPermissionByRoleNames(...admin.roles),

    expiresIn: config.jwt.ACCESS_TOKEN_LIFE
  };
}

exports.getTokens = async function (basicHeader, account = 'customer') {
  const { username, password } = await _parseCredentials(basicHeader);

  if (account === 'customer') {
    return await _getCustomerTokens(username, password);
  }

  return await _getAdminTokens(username, password);
}

async function _refreshCustomerTokens(customerId, tokenVersion) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AuthenticationException({ 
      code: 'ACCOUNT_UNAVAILABLE',
      message: 'This account has been deleted' 
    });
  }

  if (!customer.active) {
    throw new AuthenticationException({ 
      code: 'ACCOUNT_UNAVAILABLE',
      message: 'This account has been deactived' 
    });
  }

  if (customer.tokenVersion != tokenVersion) {
    throw new AuthenticationException({ 
      code: 'CREDENTIALS_HAVE_CHANGED',
      message: 'Cannot use this token' 
    });
  }

  return {
    accessToken: jwt.createAccessToken({
      type: 'customer',
      id: customer._id,
      version: customer.tokenVersion
    }),

    refreshToken: jwt.createRefreshToken({
      type: 'customer',
      id: customer._id,
      version: customer.tokenVersion
    }),

    expiresIn: config.jwt.ACCESS_TOKEN_LIFE
  };
}

async function _refreshAdminTokens(id, tokenVersion) {
  const admin = await Admin.findById(id);

  if (!admin) {
    throw new AuthenticationException({ 
      code: 'ACCOUNT_UNAVAILABLE',
      message: 'This account has been deleted' 
    });
  }

  if (!admin.active) {
    throw new AuthenticationException({ 
      code: 'ACCOUNT_UNAVAILABLE',
      message: 'This account has been deactived' 
    });
  }

  if (admin.tokenVersion != tokenVersion) {
    throw new AuthenticationException({
      code: 'CREDENTIALS_HAVE_CHANGED',
      message: 'Cannot use this token' 
    });
  }

  return {
    accessToken: jwt.createAccessToken({
      type: 'admin',
      id: admin._id,
      version: admin.tokenVersion
    }),

    refreshToken: jwt.createRefreshToken({
      type: 'admin',
      id: admin._id,
      version: admin.tokenVersion
    }),

    expiresIn: config.jwt.ACCESS_TOKEN_LIFE
  };
}

exports.refreshTokens = async function (data, account = 'customer') {
  const token = data && data.refreshToken;
  if (!token) {
    throw new AuthenticationException({ 
      message: 'Refresh token not provided' 
    });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verifyRefreshToken(token);

  } catch (e) {
    throw new AuthenticationException({ 
      message: _.upperFirst(e.message) 
    });
  }

  const { id, version } = decodedToken;

  if (account === 'customer') {
    return await _refreshCustomerTokens(id, version);
  }

  return await _refreshAdminTokens(id, version);
}
