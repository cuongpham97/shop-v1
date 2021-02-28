const CheckoutSchema = require('../schemas/checkout.schema');

module.exports = {
  schema: CheckoutSchema, apply: mongoose => mongoose.model('checkout', CheckoutSchema)
};
