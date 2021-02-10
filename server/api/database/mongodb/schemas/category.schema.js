const { Schema } = require('mongoose');

async function uniqueCategoryName(name) {
  if (!this.isModified('name')) return true;
 
  const category = await this.constructor.findOne({ 'name': name });
  return !category;
}

const CategorySchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 200, 
    required: true,
    validate: { validator: uniqueCategoryName, msg: 'msg: Category name already in use' }
  },
  ancestors: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'category'
  }],
  order: {
    type: Number,
    default: 100
  },
  description: {
    type: String,
    maxLength: 2000
  }
});

module.exports = CategorySchema;
