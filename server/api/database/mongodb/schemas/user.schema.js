const { Schema } = require('mongoose');
const { regexes } = require('../../../../utilities/constants');
const { hashPassword } = require('../../../../utilities/hashing');
const _ = require('lodash');
const Location = require('./location.schema');

async function uniqueEmail(email) {
  const model = this.parent().constructor;
  const user = await model.findOne({ 'local.email': email });
  return !user;
}

async function uniquePhone(phone) {
  const model = this.parent().constructor;
  const user = await model.findOne({ 'local.phone': phone });
  return !user;
}

const LocalProvider = new Schema({
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
    maxLength: 16,
    required: true
  }
}, { _id: false });

LocalProvider.pre('validate', function (next) {
  let email = this.get('email');
  let phone = this.get('phone');

  if (email && !phone) {
    throw new Error('"local.email" or "local.phone" number is required');
  }
  
  return next();
});

LocalProvider.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.set('password', await hashPassword(this.get('password')));

  return next();
});

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
    type: LocalProvider
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

UserSchema.pre('validate', function (next) {
  let providers = ['google', 'facebook', 'local'];
  let hasProvider = providers.some(provider => !_.isEmpty(this.get(provider)));

  if (!hasProvider) {
    throw new Error('At least one auth provider is required');
  }

  return next();
});

module.exports = UserSchema;
