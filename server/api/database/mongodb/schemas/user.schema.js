const { Schema } = require('mongoose');
const { ValidationException } = require('../../../exceptions');
const { regexes } = require('../../../../utilities/constants');
const { hashPassword } = require('../../../../utilities/hashing');
const _ = require('lodash');
const Location = require('./location.schema');

async function uniqueEmail(email) {
  const user = await this.constructor.findOne({ 'local.email': email });
  return !user;
}

async function uniquePhone(phone) {
  const user = await this.constructor.findOne({ 'local.phone': phone });
  return !user;
}

const UserSchema = new Schema({
  name: {
    first: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 20,
    },
    last: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 20,
    }
  },
  displayName: {
    type: String,
    trim: true,
    minLength: 2,
    maxLength: 100,
    required: true
  },
  gender: {
    type: String,
    lowercase: true,
    match: regexes.GENDER,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  phones: {
    type: [{
      type: String,
      match: regexes.PHONE_NUMBER
    }]
  },
  addresses: {
    type: [Location],
    default: []
  },
  avatar: {
    type: String,
    default: null
  },
  local: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: regexes.EMAIL,
      validate: { validator: uniqueEmail, msg: 'msg: "local.email" already in use' }
    },
    phone: {
      type: String,
      trim: true,
      match: regexes.PHONE_NUMBER,
      validate: { validator: uniquePhone, msg: 'msg: "local.phone" already in use' }
    },
    password: {
      type: String,
      minLength: 6,
      maxLength: 16
    }
  },
  google: {
    id: String,
    name: String,
    token: String,
    email: String
  },
  facebook: {
    id: String,
    name: String,
    token: String,
    email: String
  },
  active: {
    type: Boolean,
    default: true
  }
});

UserSchema.pre('validate', async function(next) {
  let that = this;

  let providers = ['google', 'facebook', 'local'];
  let hasProvider = providers.some(provider => !_.isEmpty(that.get(provider)));

  if (!hasProvider) {
    return next(
      new ValidationException({ message: 'At least one auth provider is required' })
    );
  }

  if (!_.isEmpty(that.get('local'))) {

    let email = that.get('local.email');
    let phone = that.get('local.phone')
    let password = that.get('local.password');

    if (!email && !phone) {
      return next(
        new ValidationException({ message: '"local.email" or "local.phone" number is required' })
      );
    }

    if(!password) {
      return next(
        new ValidationException({ message: '"local.password" is required' })
      );
    }
  }

  return next();
});

UserSchema.post('validate', async function()
{ 
  if (!_.isEmpty(this.get('local'))) { 
    this.set('local.password', await hashPassword(this.get('local.password')));
  }
});

module.exports = UserSchema;
