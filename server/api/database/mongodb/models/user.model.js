const mongoose = require('mongoose');
const { ValidationException } = require('../../../exceptions');
const { regexes } = require('../../../../utilities/constants');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const AddressSchema = new Schema({
  block: {
    type: String,
    trim: true,
    minlength: 1,
    maxLength: 100,
    required: true
  },
  district: {
    type: String,
    trim: true,
    minlength: 1,
    maxLength: 100,
    required: true, 
  },
  province: {
    type: String,
    trim: true,
    minlength: 1,
    maxLength: 100,
    required: true
  }
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
  address: {
    type: [AddressSchema],
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
      match: [regexes.EMAIL]
    },
    phone: {
      type: String,
      trim: true,
      match: [regexes.PHONE_NUMBER]
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

UserSchema.pre('validate', function(next) {
  let that = this;

  let providers = ['google', 'facebook', 'local'];
  let hasProvider = providers.some(provider => !_.isEmpty(that.get(provider)));

  if (!hasProvider) {
    return next(
      new ValidationException({ message: 'At least one auth provider is required' })
    );
  }

  if (!_.isEmpty(that.get('local'))) {

    if (!that.get('local.email') && !that.get('local.phone')) {
      return next(
        new ValidationException({ message: 'local.email or local.phone number is required' })
      );
    }

    if(!that.get('local.password')) {
      return next(
        new ValidationException({ message: 'local.password is required' })
      );
    }
  }

  return next();
});

UserSchema.post('validate', async function(next)
{
  //hash password
  if (!_.isEmpty(this.get('local'))) { 
    const salt = await bcrypt.genSalt(10);
    const hash =  await bcrypt.hash(this.get('local.password'), salt);
    this.set('local.password', hash);
  }

});

module.exports = mongoose.model('user', UserSchema, 'user');
