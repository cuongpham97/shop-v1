const validate = require('~utils/validate');
const imageService = require('~services/image.service');
const { updateDocument } = require('~utils/tools');
const { regexes } = require('~utils/constants');
const { mongodb } = require('~database');
const CustomerGroup = mongodb.model('customer-group');
const Customer = mongodb.model('customer');
const Image = mongodb.model('image');
const moment = require('moment');

async function _filterCheckExistInput(input) {
  const validation = await validate(input, {
    'email': 'required_one_of:email,phone|string|trim|lowercase|email',
    'phone': 'string|trim|phone',
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return _.pick(validation.result, ['email', 'phone']);
}

exports.checkExist = async function (data) {
  const input = await _filterCheckExistInput(data);

  return !!await Customer.findOne({ 'local': input });
}

function _projectDocument(customer) {
  if (customer.toJSON) {
    customer = customer.toJSON();
  }

  return _.omit(customer, ['local', 'google', 'facebook', '__v']);
}

async function _filterFindQuery(query) {
  const validation = await validate(query, {
    'search': 'not_allow',
    'regexes': 'object|mongo_guard',
    'filters': 'object|mongo_guard',
    'orders': 'to:array',
    'orders.*': 'string|min:1|max:100|mongo_guard',
    'fields': 'to:array',
    'fields.*': 'string|min:1|max:100|mongo_guard',
    'page': 'integer|min:1',
    'pageSize': 'integer|min:1|max:200'
  });

  if (validation.errors) {
    throw new BadRequestException({
      code: 'WRONG_QUERY_PARAMETERS',
      message: `Invalid query parameters \`${validation.errors.keys().join(', ')}\``
    });
  }

  return validation.result;
}

exports.find = async function (query) {
  query = await _filterFindQuery(query);
  return await Customer.paginate(query, _projectDocument);
}

async function _filterFindByIdInput(input) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'fields': 'to:array',
    'fields.*': 'string|min:1|max:100|mongo_guard'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.first()
    });
  }

  return validation.result;
}

exports.findById = async function (id, fields = []) {
  const input = await _filterFindByIdInput({ id, fields });

  const customer = await Customer.findById(input.id, input.fields);
  if (!customer) {
    throw new NotFoundException({
      message: 'Customer ID not does not exist'
    });
  }

  return _projectDocument(customer);
}

async function _filterNewCustomerInput(input, provider) {
  const rule = {
    'name': 'object|nullable',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'required|string|trim|min:2|max:100',
    'gender': ['required', 'regex:' + regexes.GENDER],
    'birthday': 'date:DD/MM/YYYY',
    'phone': 'string|trim|phone',
    'email': 'string|trim|lowercase|email',
    'avatar': 'mongo_id',
    'addresses': 'array',
    'addresses.*': 'object',
    'addresses.*.name': 'required|string|trim|min:2|max:100',
    'addresses.*.type': 'required|string|enum:HOME,COMPANY',
    'addresses.*.phone': 'required|string|trim|phone',
    'addresses.*.address': 'required|location',
    'groups': 'not_allow',
    'active': 'not_allow'
  };

  const providerRules = {
    local: {
      'local': 'required|object',
      'local.email': 'required_without:local.phone|string|trim|lowercase|email',
      'local.phone': 'required_without:local.email|string|trim|phone',
      'local.password': 'required|string|min:6|max:16',
      'google': 'not_allow',
      'facebook': 'not_allow',
    },
    google: {
      'local': 'not_allow',
      'google': 'required|object',
      'google.id': 'required|string',
      'facebook': 'not_allow'
    },
    facebook: {
      'local': 'not_allow',
      'google': 'not_allow',
      'facebook': 'required|object',
      'facebook.id': 'required|string'
    }
  }

  const validation = await validate(input, _.merge(rule, providerRules[provider]));

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

async function _setAvatar(customer, imageId, session) {
  const image = await Image.findById(imageId);
  if (!image) {
    throw new NotFoundException({
      message: 'Avatar image does not exist'
    });
  }

  await imageService.set(imageId, `customer:${customer._id}/avatar`, session);

  customer.set('avatar', image);
}

async function _prepareNewCustomer(input, session) {
  const customer = new Customer(input);

  if (input.avatar) {
    await _setAvatar(customer, input.avatar, session);
  }

  return customer;
}

exports.create = async function (data, provider = 'local') {
  const input = await _filterNewCustomerInput(data, provider);

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const newCustomer = await _prepareNewCustomer(input, session);
    await newCustomer.save({ session });

    return _projectDocument(newCustomer);
  });
}

async function _filterUpdateCustomerInput(input, role) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'string|trim|min:2|max:100',
    'gender': ['regex:' + regexes.GENDER],
    'birthday': 'date:DD/MM/YYYY',
    'phone': 'string|trim|phone',
    'email': 'string|trim|lowercase|email',
    'avatar': 'mongo_id',
    'addresses': 'array',
    'addresses.*': 'object',
    'addresses.*.name': 'required|string|trim|min:2|max:100',
    'addresses.*.type': 'required|string|enum:HOME,COMPANY',
    'addresses.*.phone': 'required|string|trim|phone',
    'addresses.*.address': 'required|location',
    'groups': role === 'admin' ? 'array|unique|max:20' : 'not_allow',
    'groups.*': 'mongo_id',
    'active': 'not_allow',
    'local': 'not_allow',
    'google': 'not_allow',
    'facebook': 'not_allow'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

async function _changeAvatar(customer, newImageId, session) {
  const oldImage = customer.avatar && customer.avatar._id;
  const newImage = newImageId;
  const isChange = !ObjectId(oldImage).equals(newImage);

  customer.avatar = null;

  if (isChange && newImage) {
    customer.avatar = await Image.findById(newImage);

    if (!customer.avatar) {
      throw new NotFoundException({
        message: 'Avatar image ID does not exist'
      });
    }

    await imageService.set(newImage, `customer:${customer._id}/avatar`, session);
  }

  if (isChange && oldImage) {
    await imageService.unset(oldImage._id, `customer:${customer._id}/avatar`, session);
  }

  return customer;
}

async function _changeCustomerGroups(customer, newGroups, session) {
  const oldGroups = customer.groups;
  const isChange = _(oldGroups).xorWith(newGroups, (a, b) => a.equals(b)).value().length;

  if (isChange && oldGroups.length) {
    await CustomerGroup.updateMany(
      { "_id": { "$in": oldGroups } },
      { "$inc": { "nCustomer": -1 } },
      { session }
    );
  }

  if (isChange && newGroups.length) {
    await CustomerGroup.updateMany(
      { "_id": { "$in": newGroups } },
      { "$inc": { "nCustomer": 1 } },
      { session }
    );
  }

  customer.set('groups', newGroups);

  return customer;
}

async function _prepareUpdateCustomer(customer, input, session) {
  const clone = { ...input };

  if ('avatar' in input) {
    await _changeAvatar(customer, clone.avatar, session);
    delete clone.avatar;
  }

  if ('groups' in input) {
    await _changeCustomerGroups(customer, clone.groups, session);
    delete clone.groups;
  }

  return updateDocument(customer, clone);
}

exports.partialUpdate = async function (id, data, role) {
  const input = await _filterUpdateCustomerInput({ id, ...data }, role);

  const customer = await Customer.findById(input.id);
  if (!customer) {
    throw new NotFoundException({
      message: 'Customer ID not does not exist'
    });
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const updated = await _prepareUpdateCustomer(customer, input, session);
    await updated.save({ session });

    return _projectDocument(customer);
  });
}

async function _filterChangePasswordInput(input, role) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'password': role === 'customer' ? 'required|string|min:6|max:16' : 'unset',
    'newPassword': 'required|string|min:6|max:16'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

/**
 * @param {string} id 
 * @param {object} data
 * @param {('customer'|'admin')} role
 */
exports.changePassword = async function (id, data, role = 'customer') {
  const input = await _filterChangePasswordInput({ id, ...data });

  const customer = Customer.findById(input.id);
  if (!customer) {
    throw new NotFoundException({ 
      message: 'Customer ID does not exist' 
    });
  }

  if (!customer.local) {
    throw new BadRequestException({
      code: 'CANNOT_BE_CHANGED',
      message: 'Customer does not use local provider'
    });
  }

  const match = role === 'admin'
    ? true
    : await customer.comparePassword(input.password);

  if (!match) {
    throw new AuthenticationException({ 
      message: 'Password is incorrect' 
    });
  }

  const update = {
    "local": { "password": input.newPassword },
    "tokenVersion": moment().valueOf()
  };

  await updateDocument(customer, update).save();

  return true;
}

async function _filterDeleteByIdInput(input) {
  const validation = await validate(input, { 
    'id': 'mongo_id' 
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.first() 
    });
  }

  return validation.result;
}

async function _unsetAvatar(customer) {
  if (customer.avatar) {
    await imageService.unset(customer.avatar._id, `customer:${customer._id}/avatar`);
  }

  customer.set('avatar', null);
}

async function _decreaseGroupsMember(groups) {
  if (groups.length) {
    await CustomerGroup.updateMany(
      { "_id": { "$in": groups } },
      { "$inc": { "nCustomer": -1 } }
    );
  }
}

exports.deleteById = async function (id) {
  const input = await _filterDeleteByIdInput({ id });

  const customer = await Customer.findByIdAndDelete(input.id).select('_id avatar groups');
  if (!customer) {
    throw new NotFoundException({ 
      message: 'Customer ID does not exist' 
    });
  }

  await _unsetAvatar(customer);
  await _decreaseGroupsMember(customer.groups);

  return {
    expected: 1,
    found: [input.id],
    deletedCount: 1
  };
}

async function _filterDeleteManyInput(input) {
  const validation = await validate(input, {
    'ids': 'to:array|unique',
    'ids.*': 'mongo_id'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

async function _unsetAvatars(customersArray) {
  const images = customersArray.map(customer => customer.avatar && customer.avatar._id).filter(Boolean);
  
  await imageService.unsetMany(images, customersArray.map(customer => `customer:${customer._id}/avatar`));
}

exports.deleteMany = async function (ids) {
  const input = await _filterDeleteManyInput({ ids });

  const customers = await Customer.find({ "_id": { "$in": input.ids } }, '_id avatar groups');
  if (!customers.length) {
    throw new NotFoundException({ 
      message: 'Customer IDs does not exist' 
    });
  }

  const foundIds = customers.map(customer => customer._id);
  const result = await Customer.deleteMany({ "_id": { "$in": foundIds } });

  await _unsetAvatars(customers);

  for (const groups of customers.map(customer => customer.groups)) {
    await _decreaseGroupsMember(groups);
  }

  return {
    expected: input.ids.length,
    found: foundIds,
    deletedCount: result.deletedCount
  };
}
