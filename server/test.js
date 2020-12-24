const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const TestSchema = new Schema({
  phones: {
    type: Schema.Types.ObjectId
  }
});

TestSchema.post('validate', function(error, doc, next) {
  console.log(JSON.stringify(error));
});

mongoose.model('use', TestSchema, 'use');

mongoose.model('use').create({ phones: { name: 5 } });


console.log(_.startCase('decimal128'));