const mongodb = require('../database/mongodb');
const validate = require('../../utilities/validator');
const { ValidationException } = require('../exceptions');
const _ = require('lodash');

exports.find = async function(query) {

  let validation = await validate(query, {
    'regexes'   : 'object|mongo_guard',
    'filters'   : 'object|mongo_guard',
    'orders'    : 'to:array',
    'orders.*'  : 'string|min:1|max:100|mongo_guard',
    'fields'    : 'to:array',
    'fields.*'  : 'string|min:1|max:100|mongo_guard',
    'page'      : 'integer|min:1',
    'pageSize'  : 'integer|min:1|max:200'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  let options = validation.result;
  _.unset(options, 'search');

  return await mongodb.model('user').paginate(options);
}

exports.create = async function(user) {
  return await mongodb.model('user').create(user);
}
