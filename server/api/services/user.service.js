const mongodb = require('../database/mongodb');
const validate = require('../../utilities/validator');
const { ValidationException } = require('../exceptions');
const _ = require('lodash');
const { regexes } = require('../../utilities/constants');

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

  let rule = {
    'name'                : 'object',
    'name.first'          : 'string|trim|min:1|max:20',
    'name.last'           : 'string|trim|min:1|max:20',
    'displayName'         : 'required|string|trim|min:2|max:100',
    'gender'              : ['required', 'lowercase','regex:' + regexes.GENDER],
    'birthday'            : 'date:YYYY/MM/DD',
    'phones'              : 'to:array',
    'phones.*'            : 'string|trim|phone',
    'addresses'           : 'array',
    'addresses.*'         : 'object',
    'addresses.*.block'   : 'required|trim|min:1|max:100',
    'addresses.*.district': 'required|trim|min:1|max:100',
    'addresses.*.province': 'required|trim|min:1|max:100',
    'active'              : 'not_allow'
  };

  let providerRules = {
    local: {
      'local'          : 'required|object',
      'local.email'    : 'string|trim|lowercase|email',
      'local.phone'    : 'string|trim|phone',
      'local.password' : 'required|string|min:6|max:16',
      'google'         : 'not_allow',
      'facebook'       : 'not_allow'
    },
    google: {
      'local'          : 'not_allow',
      'google'         : 'required|object',
      'google.id'      : 'required|string',
      'facebook'       : 'not_allow'
    },
    facebook: {
      'local'          : 'not_allow',
      'google'         : 'not_allow',
      'facebook'       : 'required|object',
      'facebook.id'    : 'required|string'
    }
  }
  
  let validation = await validate(user, _.merge(rule, providerRules[provider]));

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  return await mongodb.model('user').create(validation.result);
}
