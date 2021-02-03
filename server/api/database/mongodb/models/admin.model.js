const AdminSchema = require('../schemas/admin.schema');

module.exports = {
  schema: AdminSchema, apply: mongoose => mongoose.model('admin', AdminSchema)
};
