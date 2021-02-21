const { Schema } = require('mongoose');
const { regexes } = require('~utils/constants');
const { hashPassword, comparePassword } = require('~utils/hashing');
const Location = require('./location.schema');
const moment = require('moment');

const Avatar = new Schema({
  name: String,
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  size: Number
});

async function uniqueEmail(email) {
  if (!this.isModified('email')) return true;
  
  const model = this.parent().constructor;
  const customer = await model.findOne({ "local.email": email }, '_id');
  return !customer;
}

async function uniquePhone(phone) {
  if (!this.isModified('phone')) return true;

  const model = this.parent().constructor;
  const customer = await model.findOne({ "local.phone": phone }, '_id');
  return !customer;
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
    required: true
  }
}, { _id: false });

LocalProvider.pre('validate', function (next) {
  let email = this.get('email');
  let phone = this.get('phone');

  if (!email && !phone) {
    throw new Error('"local.email" or "local.phone" number is required');
  }
  
  return next();
});

LocalProvider.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.set('password', await hashPassword(this.get('password')));

  return next();
});

const CustomerSchema = new Schema({
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
    type: Avatar,
    default: null
  },
  groups: {
    type: [{
      type: ObjectId,
      ref: 'customer-group'
    }],
    default: []
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
  tokenVersion: {
    type: String,
    default: moment().valueOf()
  },
  active: {
    type: Boolean,
    default: true
  }
});

CustomerSchema.pre('validate', function (next) {
  let providers = ['google', 'facebook', 'local'];
  let hasProvider = providers.some(provider => !_.isEmpty(this.get(provider)));

  if (!hasProvider) {
    throw new Error('At least one auth provider is required');
  }

  return next();
});

CustomerSchema.methods.comparePassword = async function (password) {
  return await comparePassword(password, this.get('local.password'));
}

module.exports = CustomerSchema;
