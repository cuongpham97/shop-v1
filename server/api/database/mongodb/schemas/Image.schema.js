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
  usedFor: {
    type: [String],
    default: []
  },
  creator: {
    id: String,
    name: String
  },
  description: String
});

module.exports = Image;
