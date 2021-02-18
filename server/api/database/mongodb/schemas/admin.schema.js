const { Schema } = require('mongoose');
const { regexes } = require('~utils/constants');
const { hashPassword, comparePassword } = require('~utils/hashing');
const moment = require('moment');
const Location = require('./location.schema');

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

async function uniqueUsername(username) {
  if (!this.isModified('username')) return true;
 
  const admin = await this.constructor.findOne({ 'username': username });
  return !admin;
}

const AdminSchema = new Schema({
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
  phone: {
    type: String,
    match: regexes.PHONE_NUMBER
  },
  address: Location,
  avatar: {
    type: Avatar,
    default: null
  },
  username: {
    type: String,
    match: /^\w[\w\_\.]+$/,
    minLength: 6,
    maxLength: 16,
    lowercase: true,
    required: true,
    validate: { validator: uniqueUsername, msg: 'msg: Username already in use' }
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: []
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

AdminSchema.pre('save', async function(next) { 
  if (!this.isModified('password')) return true;
  this.set('password', await hashPassword(this.get('password')));
 
  return next();
});

AdminSchema.methods.comparePassword = async function (password) {
  return await comparePassword(password, this.get('password'));
}

module.exports = AdminSchema;
