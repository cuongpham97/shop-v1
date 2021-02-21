const CartSchema = require('../schemas/cart.schema');

module.exports = {
  schema: CartSchema, apply: mongoose => mongoose.model('cart', CartSchema)
};
