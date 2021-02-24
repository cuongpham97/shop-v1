const { Schema } = require('mongoose');

const Image = new Schema({
  name: String,
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  size: Number,
  imgur: {
    id: String,
    deleteHash: String
  },
  related: {
    type: [String],
    default: []
  },
  creator: {
    account: {
      type: String,
      enum: ['admin', 'customer']
    },
    id: ObjectId,
    name: String
  },
  description: String
});

module.exports = Image;
