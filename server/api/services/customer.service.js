const validate = require('~utils/validator');
const imageService = require('~services/image.service');
const { updateDocument } = require('~utils/tools');
const { regexes } = require('~utils/constants');
const { mongodb } = require('~database');

exports.model = mongodb.model('customer');

exports.find = async function (query) {

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
    throw new ValidationException({ message: validation.errors });
  }

  return await mongodb.model('customer').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const customer = await mongodb.model('customer').findById(id, fields);

  if (!customer) {
    throw new NotFoundException({ message: 'Customer ID not found' });
  }

  return customer;
}

exports.create = async function (customer, provider = 'local') {

  const rule = {
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'required|string|trim|min:2|max:100',
    'gender': ['required', 'lowercase', 'regex:' + regexes.GENDER],
    'birthday': 'date:YYYY/MM/DD',
    'phones': 'to:array',
    'phones.*': 'string|trim|phone',
    'avatar': 'mongo_id',
    'addresses': 'array',
    'addresses.*': 'object',
    'addresses.*.block': 'required|trim|min:1|max:100',
    'addresses.*.district': 'required|trim|min:1|max:100',
    'addresses.*.province': 'required|trim|min:1|max:100',
    'active': 'not_allow'
  };

  const providerRules = {
    local: {
      'local': 'required|object|only_one_of:local.email,local.phone',
      'local.email': 'string|trim|lowercase|email',
      'local.phone': 'string|trim|phone',
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

  const validation = await validate(customer, _.merge(rule, providerRules[provider]));

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  customer = validation.result;

  if (!customer.avatar) {
    return await mongodb.model('customer').create(customer);
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {
    
    const image = await mongodb.model('image').findById(customer.avatar);

    if (!image) {
      throw new NotFoundException({ message: 'Avatar image ID does not exist' });
    }

    customer.avatar = image;

    const [newCustomer] = await mongodb.model('customer').create([customer], { session });

    await imageService.set(image.id, `customer/${newCustomer.id}/avatar`);

    return newCustomer;
  });
}

exports.partialUpdate = async function (id, data) {

  data.id = id;

  const validation = await validate(data, {
    'id': 'mongo_id',
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'string|trim|min:2|max:100',
    'gender': ['lowercase', 'regex:' + regexes.GENDER],
    'birthday': 'date:YYYY/MM/DD',
    'phones': 'to:array',
    'phones.*': 'string|trim|phone',
    'avatar': 'mongo_id',
    'addresses': 'array',
    'addresses.*': 'object',
    'addresses.*.block': 'required|trim|min:1|max:100',
    'addresses.*.district': 'required|trim|min:1|max:100',
    'addresses.*.province': 'required|trim|min:1|max:100',
    'active': 'not_allow',
    'local': 'not_allow',
    'google': 'not_allow',
    'facebook': 'not_allow'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  let customer = await mongodb.model('customer').findById(id);

  if (!customer) {
    throw new NotFoundException({ message: 'Customer ID not found' });
  }
  
  if (_.has(data, 'avatar')) {

    let newImage = null;

    if (data.avatar) {
      newImage = await mongodb.model('image').findById(data.avatar);

      if (!newImage) {
        throw new NotFoundException({ message: 'Avatar image ID does not exist' });
      }

      await imageService.set(newImage.id, `customer/${customer.id}/avatar`);
    }

    data.avatar = newImage;

    const oldImage = customer.avatar;
    const isChange = oldImage && (!newImage || !oldImage.id.equals(newImage.id));

    if (isChange) {
      await imageService.unset(oldImage.id, `customer/${customer.id}/avatar`);
    }
  }

  await updateDocument(customer, data).save();

  return customer;
}

/**
 * @param {string} id 
 * @param {object} data
 * @param {('customer'|'admin')} role
 */
exports.changePassword = async function (id, data, role = 'customer') {

  data.id = id;

  const rules = {
    'id': 'mongo_id',
    'password': role === 'customer' ? 'required|string|min:6|max:16' : 'unset',
    'newPassword': 'required|string|min:6|max:16'
  };

  const validation = await validate(data, rules);

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  let customer = await mongodb.model('customer').findById(id);

  if (!customer) {
    throw new NotFoundException({ message: 'Customer ID not found' });
  }

  if (!customer.local) {
    throw new BadRequestException({ message: 'Customer does not use local provider' });
  }

  const match = role === 'admin' 
    ? true 
    : await customer.comparePassword(validation.result.password);

  if (!match) {
    throw new AuthenticationException({ message: 'Password is incorrect' });
  }

  const update = { 
    "local": { "password": validation.result.newPassword }, 
    "tokenVersion": moment().valueOf() 
  };

  await updateDocument(customer, update).save();

  return true;
}

exports.deleteById = async function (id) {
  
  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const customer = await mongodb.model('customer').findByIdAndDelete(id).select('_id avatar');

  if (!customer) {
    throw new NotFoundException({ message: 'Customer ID does not exist' });
  }

  const image = customer.avatar;

  if (image) {
    await imageService.unset(image._id, `customer/${customer.id}/avatar`);
  }

  return {
    expected: 1,
    found: [id],
    deletedCount: 1
  };
}

exports.deleteMany = async function (ids) {
  
  const validation = await validate({ 'ids': ids }, {
    'ids': 'to:array|unique',
    'ids.*': 'mongo_id'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  ids = validation.result.ids;

  const docs = await mongodb.model('customer').find({ _id: { "$in": ids } }).select('_id avatar');

  if (!docs.length) {
    throw new NotFoundException({ message: 'Customer IDs does not exist' });
  }

  const found = docs.map(doc => doc.id);
  const images = docs.map(doc => doc.avatar && doc.avatar.id).filter(Boolean);

  const result = await mongodb.model('customer').deleteMany({ "_id": { "$in": found } }); 

  await imageService.unsetMany(images, found.map(id => `customer/${id}/avatar`));
  
  return {
    expected: ids.length,
    found: found,
    deletedCount: result.deletedCount
  };
}
