const CustomerGroupSchema = require('../schemas/customer-group.schema');

module.exports = {
  schema: CustomerGroupSchema, 
  apply: mongoose => mongoose.model('customer-group', CustomerGroupSchema)
};
