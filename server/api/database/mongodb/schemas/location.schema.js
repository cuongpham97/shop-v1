const { Schema } = require('mongoose');

const Location = new Schema({
  street: {
    type: String,
    trim: true,
    maxLength: 200,
    required: true
  },
  ward: {
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  district: {
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  province: {
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }
}, { _id: false });

module.exports = Location;
