const CategorySchema = require('../schemas/category.schema');

module.exports = {
  schema: CategorySchema, apply: mongoose => mongoose.model('category', CategorySchema)
};
