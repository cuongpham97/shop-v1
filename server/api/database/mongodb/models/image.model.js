const ImageSchema = require('../schemas/image.schema.js');

module.exports = {
  schema: ImageSchema, apply: mongoose => mongoose.model('image', ImageSchema)
};
