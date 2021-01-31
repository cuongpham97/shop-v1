const RoleSchema = require('../schemas/role.schema');

module.exports = {
  schema: RoleSchema, apply: mongoose => mongoose.model('role', RoleSchema)
};
