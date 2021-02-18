const ProductSchema = require('../schemas/product.schema');

module.exports = {
  schema: ProductSchema, apply: mongoose => mongoose.model('product', ProductSchema)
};
