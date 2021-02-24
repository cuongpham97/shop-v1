const { Schema } = require('mongoose');

async function _uniqueCategoryName(name) {
  if (!this.isModified('name')) return true;
 
  const category = await this.constructor.findOne({ "name": name }, '_id');
  return !category;
}

const CategorySchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 200, 
    required: true,
    validate: { validator: _uniqueCategoryName, msg: 'msg: Category name already in use' }
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
