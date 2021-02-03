const validate = require('~utils/validator');
const { mongodb } = require('~database');
const { regexes } = require('~utils/constants');
const roleService = require('~services/role.service');
const config = require('~config');
const jwt = require('~utils/jwt');

// TODO: strict admin token / user token

exports.getToken = async function (credentials, accountType = 'user') {

  if (!credentials) {
    throw new AuthenticationException({ message: 'Invalid credentials' });
  }

  if (credentials.startsWith('Basic ')) {
    credentials = credentials.substring(6);
  }

  const buffer = Buffer.from(credentials, 'base64');

  const [username, password] = buffer.toString('ascii').split(':');
  
  const validation = await validate({ username, password }, {
    'username': 'required|string|min:6|max:16',
    'password': 'required|string|min:6|max:16'
  });

  if (validation.errors) {
    throw new AuthenticationException({ message: 'Invalid credentials' });
  }

  if (accountType === 'user') {

    const phoneOrEmail = regexes.PHONE_NUMBER.test(username) ? 'phone' : 'email';

    const user = await mongodb.model('user').findOne({ 
      [`local.${phoneOrEmail}`]: username 
    });

    if (!user || !await user.comparePassword(password)) {
      throw new AuthenticationException({ message: 'Invalid credentials' });
    }

    return {
      name: user.displayName,
      avatar: (user.avatar && user.avatar.url) || null,

      accessToken: jwt.createAccessToken({
        id: user._id,
        version: user.tokenVersion
      }),

      refreshToken: jwt.createRefreshToken({
        id: user._id,
        version: user.tokenVersion
      }),

      expiresIn: config.jwt.ACCESS_TOKEN_LIFE
    };
  }

  if (accountType === 'admin') {
    
    const admin = await mongodb.model('admin').findOne({
      username: username
    });

    if (!admin || !await admin.comparePassword(password)) {
      throw new AuthenticationException({ message: 'Invalid credentials' });
    }

    return {
      name: admin.displayName,
      avatar: (admin.avatar && admin.avatar.url) || null,

      accessToken: jwt.createAccessToken({
        id: admin._id,
        version: admin.tokenVersion
      }),

      refreshToken: jwt.createRefreshToken({
        id: admin._id,
        version: admin.tokenVersion
      }),

      scopes: await roleService.cache.getAllPermission(...admin.roles),

      expiresIn: config.jwt.ACCESS_TOKEN_LIFE
    };
  }
}

exports.refreshToken = async function (data, accountType = 'user') {

  const token = data.refreshToken;

  if (!token) {
    throw new AuthenticationException({ message: 'Refresh token not provided' });
  }

  let decodedToken;

  try {
    decodedToken = jwt.verifyRefreshToken(token);

  } catch (e) {
    throw new AuthenticationException({ message: _.upperFirst(e.message) });
  }

  const { id, version } = decodedToken;

  if (accountType === 'user') {

    const user = await mongodb.model('user').findById(id);

    if (!user) {
      throw new AuthenticationException({ message: 'User ID does not exist' });
    }

    if (user.tokenVersion != version) {
      throw new AuthenticationException({ message: 'Cannot use this token' });
    }

    return {
      accessToken: jwt.createAccessToken({
        id: user._id,
        version: user.tokenVersion
      }),

      refreshToken: jwt.createRefreshToken({
        id: user._id,
        version: user.tokenVersion
      }),

      expiresIn: config.jwt.ACCESS_TOKEN_LIFE
    };
  }

  if (accountType === 'admin') {

    const admin = await mongodb.model('admin').findById(id);

    if (!admin) {
      throw new AuthenticationException({ message: 'Admin ID does not exist' });
    }

    if (admin.tokenVersion != version) {
      throw new AuthenticationException({ message: 'Cannot use this token' });
    }

    return {
      accessToken: jwt.createAccessToken({
        id: admin._id,
        version: admin.tokenVersion
      }),

      refreshToken: jwt.createRefreshToken({
        id: admin._id,
        version: admin.tokenVersion
      }),

      expiresIn: config.jwt.ACCESS_TOKEN_LIFE
    };
  }
}
