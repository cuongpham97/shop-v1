const { Schema } = require('mongoose');

async function _uniqueName(name) {
  if (!this.isModified('name')) return true;
  
  const model = this.constructor;
  const customerGroup = await model.findOne({ "name": name }).select('_id');
  return !customerGroup;
}

const CustomerGroupSchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true,
    validate: { validator: _uniqueName, msg: 'msg: "name" already in use' }
  },
  nCustomer: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    maxLength: 2000
  }
});

module.exports = CustomerGroupSchema;
