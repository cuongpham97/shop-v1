const mongodb = require('../database/mongodb');
const validate = require('../../utilities/validator');
const { ValidationException } = require('../exceptions');
const _ = require('lodash');

exports.find = async function(query) {

  let validation = await validate(query, {
    'search'    : 'not_allow',
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

  return await mongodb.model('user').paginate(validation.result);
}

exports.create = async function(user, provider = 'local') {
  
  return await mongodb.model('user').create(validation.result);
}
