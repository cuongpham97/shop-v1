//  const mongodb = require('./api/database/mongodb');



// const _ = require('lodash');
// const query = require('./api/middleware/querystring')

// let req = {
//   query: { regexes: "displayName=Ph" }
// };

// query.unflatten(req, null, function(){});

// (async function() {
//   console.log(await mongodb.model('user').paginate({
//     page: 1,
//     pageSize: 5
//   }));
// })()

// function deepMap(object, enumerate, callback) {

//   let keys = enumerate ? Object.getOwnPropertyNames(object) : Object.keys(object);

//   for (let key of keys) {
  
//     if (typeof object[key] === 'object') {
//       deepMap(object[key], enumerate, callback);
//     } else {
//       object[key] = callback(object[key]);
//     }

    
//   }
// }

// let o = { name: { last: 'Phạm', first: 'Cường' }, age: 23 };

// deepMap(o, false, function (value) {
//   console.log(value);
//   return value;
// });


// console.log(o);

// const { ValidationException } = require('./api/exceptions');
// const Joi = require('joi');

// async function validate(value, schema) {
//   let { error, val } = await schema.validate(value, { abortEarly: false });

//   if (error) {

//     let msg = error.details.reduce((acc, info) => acc.concat([info.message]) ,[]);

//     throw new ValidationException({ message: msg });
//   }


//   return val;
// }

// let schema = Joi
//   .object({
//     page:     Joi.number().integer().min(1),
//     pageSize: Joi.number().integer().min(1).max(200)
//   });

// validate({ }, schema);

// validate(
//   , 
//   schema => {
//     return schema.,
//   () => {

//   }
// });


// const mongoose = require('mongoose');

// let schema = new mongoose.Schema({
//   age: {
//     type: String
//   }
// });

// schema.post('validate', function (error, doc, next) {
//   console.log(JSON.stringify(error));
// });

// const model = mongoose.model('user', schema);

// let a = new model({ age: 1000 });

// let error = a.validateSync();

// console.log(a);




// const Joi = require('joi');
// const validate = require('./utilities/validate');

// let schema = Joi
//   .object({
//     search:   Joi.string().max(200).default(''),
//     filters:  Joi.object().default({}),
//     regexes:  Joi.object().default({}),
//     fields:   Joi.array().default([]),
//     orders:   Joi.object().default([]),
//     page:     Joi.number().integer().min(1).default(1),
//     pageSize: Joi.number().integer().min(1).max(200).default(80),
//   });

// validate({ page: 0 }, schema);

const validator = require('./utilities/validator');


let value = {
  search: 4,
  filters: "sdf",
  fields: ['wewe'],
  page: '0',
  pageSize: 34
};

(async function () {
  
  let { result, errors } = await validator(value, {
    'search'    :'string',
    'regexes'   :'object',
    'filters'   :'object',
    'orders'    :'array',
    'fields'    :'array',
    'page'      :'integer|min:1',
    'pageSize'  :'integer|min:1|max:200'
  });

  console.log(errors);
})();


// let c = 6;

// Validator.registerAsync('test', function (value, args, attribute, passes) {
//   console.log(this.validator.input.age = 3);
//   passes();
// });

// let input = {
//   age: 6
// }
// let validate = new Validator(input,{
//   age: 'test:5:3'
// }, {
//   test: "sdfsdfsdf"
// });

// validate.checkAsync(()=> { }, null);

