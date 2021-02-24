const { Schema } = require('mongoose');

async function _uniqueRoleName(name) {
  if (!this.isModified('name')) return true;

  const role = await this.constructor.findOne({ "name": name }, '_id');
  return !role;
}

function _validatePermission(permission) {
  if (!this.isModified('permission')) return true;

  //TODO: validate permission
  return true;
}

const RoleSchema = new Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 200,
    required: true,
    validate: { validator: _uniqueRoleName, msg: 'msg: Role already in use'}
  },
  level: {
    type: Number,
    default: 2
  },
  permission: {
    type: Schema.Types.Mixed,
    validate: { validator: _validatePermission, msg: 'msg: Invalid permission' },
    default: {}
  },
  creator: {
    _id: ObjectId,
    name: String
  },
  updator: {
    _id: ObjectId,
    name: String
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = RoleSchema;
