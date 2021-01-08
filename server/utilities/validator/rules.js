const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Validator = require('validatorjs');
const { deepMap } = require('../tools');
const _ = require('lodash');

/**
 * Remove attribute
 */
Validator.register('unset', function(val, args, attribute) {

  let input = this.validator.input;
  _.unset(input, attribute);

  return true;
});

/**
 * Check is a phone number
 */
Validator.register('phone', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  return /^[+0-9]{8,12}$/.test(value);
});

/**
 * Check is a email
 */
Validator.register('email', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(value)) {
    // added support domain 3-n level https://github.com/skaterdav85/validatorjs/issues/384
    regex = /^((?:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]|[^\u0000-\u007F])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)+)*$/;
  }
  return regex.test(value);
});

/**
 * Not allow attribute
 */
Validator.register('not_allow', function(val) {
  return false;
});

/**
 * Cast value
 */
Validator.register('to', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  let type = args;

  switch (type) {
    case 'array': 
      _.set(input, attribute, [].concat(value));
      return true;

    default: return false;
  }
});

/**
 * Check value is a object.
 */
Validator.register('object', function(val, args, attribute) {
  let value = _.get(this.validator.input, attribute);

  return typeof value === 'object' && value !== null;
});

/**
 * Check value is a mongodb objectId and cast to ObjectId.
 */
Validator.register('mongo_id', function(val, args, attribute) {
  
  let input = this.validator.input;
  let value = _.get(input, attribute);

  const isId = /^[0-9a-fA-F]{24}$/.test(value);

  if (!isId) return false;

  _.set(input, attribute, ObjectId(value));

  return true;
});

/**
 *  Remove all $ sign that start of a string, key and value of an object.
 */
Validator.register('mongo_guard', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  switch (true) {
    // Is a string
    case typeof value === 'string' || value instanceof String:
      _.set(input, attribute, value.replace(/^\$/, '\\$'));
      return true;
    
    // Is a object
    case typeof value === 'object' && value !== null:
      deepMap(value, item => {
        return  {
          key  : `${item.key}`.replace(/^\$/, '\\$'),
          value: `${item.value}`.replace(/^\$/, '\\$')  
        }
      }, true);
  
      return true;
    
    // Other
    default: return true;
  }
});

/**
 * Check value is a string and cast to string
 */
Validator.register('string', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  const isString = !(typeof value === 'object') || value == null;

  if (!isString) return false;

  _.set(input, attribute, '' + value);

  return true;
});

/**
 * Check value is a integer and cast to integer
 */
Validator.register('integer', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  const isInteger = /^\d+$/.test(value);

  if (!isInteger) return false;

  _.set(input, attribute, parseInt(value));

  return true;
});

/**
 * Check is a array
 */
Validator.register('array', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  return Array.isArray(value);
});

/**
 * Cast value to primative data type of javascipt.
 */
Validator.register('primative', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  switch (value) {
    case 'true': 
      _.set(input, attribute, true);
      return true;

    case 'false': 
      _.set(input, attribute, false);
      return true;
    
    case 'null':
      _.set(input, attribute, null);
      return true;
    
    case 'undefined':
      _.set(input, attribute, undefined);
      return true;
    
    default:
      _.set(input, attribute, /^\d+$/.test(value) ? Number(value) : value);
      return true;
  }
});

Validator.register('uppercase', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  if (!value.toUpperCase) return false;

  _.set(input, attribute, value.toUpperCase());

  return true;
});

Validator.register('lowercase', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  if (!value.toLowerCase) return false;

  _.set(input, attribute, value.toLowerCase());

  return true;
});

Validator.register('trim', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  if (!value.trim) return false;

  _.set(input, attribute, value.trim());

  return true;
});

Validator.register('title', function(val, args, attribute) {

  let input = this.validator.input;
  let value = _.get(input, attribute);

  if (!value.toUpperCase) return false;

  _.set(input, attribute, _.startCase(_.toLower(value)));

  return true;
});
