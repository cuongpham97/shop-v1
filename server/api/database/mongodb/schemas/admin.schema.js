const { Schema } = require('mongoose');
const { regexes } = require('../../../../utilities/constants');
const { hashPassword } = require('../../../../utilities/hashing');

async function uniqueUsername(username) {
  const admin = await this.constructor.findOne({ 'username': username });
  return !admin;
}

function validatePermission(permissions) {
  //TODO: validate Mixed value
  return true;
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
    match: /^\w[\w\_\.]+$/,
    minLength: 6,
    maxLength: 16,
    required: true,
    validate: { validator: uniqueUsername, msg: 'msg: username already in use' }
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
    permissions: {
      type: Schema.Types.Mixed,
      validate: { validator: validatePermission, message: 'msg: role.permissions is invalid' }
    }
  }
});

AminSchema.post('validate', async function()
{ 
  this.set('password', await hashPassword(this.get('password')));
});


module.exports = AdminSchema;
