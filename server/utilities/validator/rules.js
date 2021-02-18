const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Validator = require('validatorjs');
const moment = require('moment');
const { deepMap } = require('~utils/tools');

function isAcceptable(value) {

  switch (true) {

    case ['', null, undefined, NaN].includes(value):
      return false;
    
    case typeof value === 'object' && _.isEmpty(value):
      return false;

    default:
      return true;
  
  }
}

Validator.registerAsync('unique', function (field, value, args, done) {

  if (!Array.isArray(value)) return done(false);

  _.set(this.input, field, [...new Set(value)]);

  return done();
});

Validator.registerAsync('enum', function (field, value, args, done) {

  return args.split(',').includes(value)
    ? done()
    : done(false, null, { enum: args });
});

Validator.registerAsync('boolean', function (field, value, args, done) {
  
  return typeof value === 'boolean'
    ? done()
    : done(false);
});

Validator.registerAsync('any', function (field, value, args, done) {
  return done();
});

Validator.registerAsync('in', function (field, value, args, done) {

  return args.split(',').includes(value)
    ? done()
    : done(false, null, { includes: args });
});

/**
 * Check value is equal with `{field}Confirm` field
 */
Validator.registerAsync('confirmed', function (field, value, args, done) {

  return value === _.get(this.input, field + 'Confirm')
    ? done()
    : done(false);
});

/**
 * only_one_of
 */
Validator.registerAsync('only_one_of', function (field, value, args, done) {

  let count = args.split(',').filter(key => isAcceptable(_.get(this.input, key))).length;

  return count === 1 
    ? done()
    : done(false, null, { field: args });
});

Validator.registerAsync('present', function (field, value, args, done) {
  
  return _.has(this.input, field)
    ? done()
    : done(false);
});

Validator.registerAsync('required_if', function (field, value, args, done) {
  
  const [otherField, otherValue] = args.split(',');

  if (_.get(this.input, otherField) == otherValue && !isAcceptable(value)) {
    return done(false, null, { or: otherField, value: otherValue });   
  }
  
  return done();
});

/**
 * The field under validation must be present and not empty only if any of the other specified fields are present
 */
Validator.registerAsync('required_with', function (field, value, args, done) {
  
  const present = args.split(',').filter(key => _.has(this.input, key)).length;

  return (present && !isAcceptable(value))
    ? done(false, null, { is: args })
    : done();
});

/**
 * required_without:foo,bar
 */
Validator.registerAsync('required_without', function (field, value, args, done) {

  if (_.has(this.input, field)) return done(); 

  const without = args.split(',').find(i => !_.has(this.input, i));

  return without 
    ? done(false, null, { is: without })
    : done();
});

/**
 * Date
 */
Validator.registerAsync('date', function(field, value, args, done) {

  let format = args || 'YYYY/MM/DD';

  return moment(value, format, true).isValid()
    ? done()
    : done(false, null, { format: format });
});

/**
 * Regex
 */
Validator.registerAsync('regex', function(field, value, args, done) {

  let rg = /^\/(?<regex>.+)\/(?<options>[img]*)$/;

  if (!rg.test(args)) {
    return done(new RegExp(args).test(value))
  }

  let match = rg.exec(args);

  return done(new RegExp(match.groups.regex, match.groups.options).test(value));
});

/**
 * Check length
 */
Validator.registerAsync('max', function(field, value, args, done) {

  let max = parseInt(args);

  if (typeof value === 'number') {
    return max >= value 
      ? done()
      : done(false, null, { max: max });
  }

  return max > value.length
    ? done()
    : done(false, null, { max: max });
});

// /**
//  * Check length
//  */
Validator.registerAsync('min', function(field, value, args, done) {
  
  let min = parseInt(args);

  if (typeof value === 'number') {
    return value >= min
      ? done()
      : done(false, null, { min: min });
  }

  return value.length >= min
    ? done()
    : done(false, null, { min: min });
});


// /**
//  * Remove attribute
//  */
Validator.registerAsync('unset', function(field, value, args, done) {

  _.unset(input, field);

  return done();
});

// /**
//  * Check is a phone number
//  */
Validator.registerAsync('phone', function(field, value, args, done) {

  return /^[+0-9]{8,12}$/.test(value) 
    ? done()
    : done(false);
});

// /**
//  * Check is a email
//  */
Validator.registerAsync('email', function(field, value, args, done) {

  let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  if (!regex.test(value)) {
    // added support domain 3-n level https://github.com/skaterdav85/validatorjs/issues/384
    regex = /^((?:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]|[^\u0000-\u007F])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)+)*$/;
  }

  return regex.test(value) 
    ? done()
    : done(false);
});

// /**
//  * Not allow attribute
//  */
Validator.registerAsync('not_allow', function(field, value, args, done) {
  return done(false);
});

Validator.registerAsync('not_allow_if', function(field, value, args, done) {
  
  const [otherField, otherValue] = args.split(',');

  return _.get(this.input, otherField) == otherValue && _.has(this.input, field)
    ? done(false, null, { or: otherField, value: otherValue })
    : done();
});

// /**
//  * Cast value
//  */
Validator.registerAsync('to', function(field, value, args, done) {

  args = args.split(',');
  let type = args[0];

  switch (type) {
    case 'array': 
      _.set(this.input, field, [].concat(value));
      return done();
    
    case 'date':
      const format = args[1] || '';
      _.set(this.input, field, moment(value, format).toDate());
      return done();

    default: return done(false);
  }
});

// /**
//  * Check value is a object.
//  */
Validator.registerAsync('object', function(field, value, args, done) {

  return (typeof value === 'object' && value !== null) 
    ? done()
    : done(false);
});

// /**
//  * Check value is a mongodb objectId and cast to ObjectId.
//  */
Validator.registerAsync('mongo_id', function(field, value, args, done) {

  const isId = /^[0-9a-fA-F]{24}$/.test(value);

  if (!isId) return done(false);

  _.set(this.input, field, ObjectId(value));

  return done();
});

// /**
//  *  Remove all $ sign that start of a string, key and value of an object.
//  */
Validator.registerAsync('mongo_guard', function(field, value, args, done) {

  switch (true) {
    // Is a string
    case typeof value === 'string' || value instanceof String:
      _.set(this.input, field, value.replace(/^\$/, '\\$'));
      return done();
    
    // Is a object
    case typeof value === 'object' && value !== null:
      deepMap(value, item => {
        return  {
          key  : `${item.key}`.replace(/^\$/, '\\$'),
          value: `${item.value}`.replace(/^\$/, '\\$')  
        }
      }, true);
  
      return done();
    
    // Other
    default: return done();
  }
});

// /**
//  * Check value is a string and cast to string
//  */
Validator.registerAsync('string', function(field, value, args, done) {

  const isString = !(typeof value === 'object') || value == null;

  if (!isString) return done(false);

  _.set(this.input, field, '' + value);

  return done();
});

Validator.registerAsync('numeric', function (field, value, args, done) {

  const num = Number(value);

  const check = typeof num === "number" && !isNaN(num) && typeof val !== "boolean";
 
  if (!check) return done(false);

  _.set(this.input, field, num);

  return done();
});

// /**
//  * Check value is a integer and cast to integer
//  */
Validator.registerAsync('integer', function(field, value, args, done) {

  const isInteger = /^\d+$/.test(value);

  if (!isInteger) return done(false);

  _.set(this.input, field, parseInt(value));

  return done();
});

// /**
//  * Check is a array
//  */
Validator.registerAsync('array', function(field, value, args, done) {

  return done(Array.isArray(value));
});

// /**
//  * Cast value to primative data type of javascipt.
//  */
Validator.registerAsync('primative', function(field, value, args, done) {

  switch (value) {
    case 'true': 
      _.set(this.input, field, true);
      return done();

    case 'false': 
      _.set(this.input, field, false);
      return done();
    
    case 'null':
      _.set(this.input, field, null);
      return done();
    
    case 'undefined':
      _.set(this.input, field, undefined);
      return done();
    
    default:
      _.set(this.input, field, /^\d+$/.test(value) ? Number(value) : value);
      return done();
  }
});

Validator.registerAsync('uppercase', function(field, value, args, done) {

  if (!value.toUpperCase) return done(false);

  _.set(this.input, field, value.toUpperCase());

  return done();
});

Validator.registerAsync('lowercase', function(field, value, args, done) {

  if (!value.toLowerCase) return done(false);

  _.set(this.input, field, value.toLowerCase());

  return done();
});

Validator.registerAsync('trim', function(field, value, args, done) {

  if (!value.trim) return done(false);

  _.set(this.input, field, value.trim());

  return done();
});

Validator.registerAsync('title', function(field, value, args, done) {

  if (!value.toUpperCase) return done(false);

  _.set(this.input, field, _.startCase(_.toLower(value)));

  return done();
});
