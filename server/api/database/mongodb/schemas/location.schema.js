const { Schema } = require('mongoose');

const Location = new Schema({
  block: {
    type: String,
    trim: true,
    minlength: 1,
    maxLength: 100,
    required: true
  },
  district: {
    type: String,
    trim: true,
    minlength: 1,
    maxLength: 100,
    required: true, 
  },
  province: {
    type: String,
    trim: true,
    minlength: 1,
    maxLength: 100,
    required: true
  }
});

module.exports = Location;
