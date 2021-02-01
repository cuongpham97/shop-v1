const validate = require('~utils/validator');
const { mongodb } = require('~database');
const { regexes } = require('~utils/constants');
const roleService = require('~services/role.service');
const config = require('~config');
const jwt = require('~utils/jwt');

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
    }
  }

  if (accountType === 'admin') {
    // TODO: create admin token
    console.log('admin running');
  }
}