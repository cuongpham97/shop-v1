const { Schema } = require('mongoose');
const { regexes } = require('../../../../utilities/constants');

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
    match: regexes.GENDER
  },
  birthday: {
    type: Date
  },
  phone: {
    type: String,
    trim: true,
    match: regexes.PHONE_NUMBER
  },
  avatar: {
    type: String,
    default: null
  },
  username: {
    type: String,
    match: /^\w+$/,
    minLength: 6,
    maxLength: 16,
    required: true
  },
  password: {
    type: String,
    minLength: 6,
    maxLength: 16,
    required: true,
  },
  role: {
    name: {
      type: String,
      enum: ['superadmin'],
      required: true
    },
    permissions: Schema.Types.Mixed
  }
});

module.exports = AdminSchema;
