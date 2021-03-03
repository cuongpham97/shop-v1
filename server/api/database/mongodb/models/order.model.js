const OrderSchema = require('../schemas/order.schema');

module.exports = {
  schema: OrderSchema, apply: mongoose => mongoose.model('order', OrderSchema)
};
