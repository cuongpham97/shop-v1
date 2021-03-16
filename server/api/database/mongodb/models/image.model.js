const ImageSchema = require('..\\schemas\\image.schema');

module.exports = {
  schema: ImageSchema, apply: mongoose => mongoose.model('image', ImageSchema)
};
