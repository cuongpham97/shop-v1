const { Schema } = require('mongoose');

async function uniqueRoleName(name) {
  if (!this.isModified('name')) return true;

  const role = await this.constructor.findOne({ name: name }).select('_id');
  return !role;
}

function validatePermission(permission) {
  if (!this.isModified('permission')) return true;

  return true;
}

const RoleSchema = new Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 200,
    required: true,
    validate: { validator: uniqueRoleName, msg: 'msg: Role already in use'}
  },
  level: {
    type: Number,
    default: 2
  },
  permission: {
    type: Schema.Types.Mixed,
    validate: { validator: validatePermission, msg: 'msg: Invalid permission' },
    default: {}
  },
  creator: {
    id: String,
    name: String
  },
  updator: {
    id: String,
    name: String
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = RoleSchema;
