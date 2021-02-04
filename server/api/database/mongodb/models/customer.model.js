const CustomerSchema = require('../schemas/customer.schema');

module.exports = {
  schema: CustomerSchema, apply: mongoose => mongoose.model('customer', CustomerSchema)
};
