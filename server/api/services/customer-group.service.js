const validate = require('~utils/validator');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');

exports.model = mongodb.model('customer-group');

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

  return await mongodb.model('customer-group').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {
  
  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const customerGroup = await mongodb.model('customer-group').findById(id, fields);

  if (!customerGroup) {
    throw new NotFoundException({ message: 'Customer group ID not does not exist' });
  }

  return customerGroup;
}

exports.create = async function (customerGroup) {

  const validation = await validate(customerGroup, {
    'name': 'required|string|min:1|max:200',
    'nCustomer': 'not_allow',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  group = validation.result;

  const newGroup = await mongodb.model('customer-group').create(group);

  return newGroup;
} 

exports.partialUpdate = async function (id, data) {

  data.id = id;

  const validation = await validate(data, {
    'id': 'mongo_id',
    'name': 'string|min:1|max:200',
    'nCustomer': 'not_allow',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  const customerGroup = await mongodb.model('customer-group').findById(id);

  if (!customerGroup) {
    throw NotFoundException({ message: 'Customer group ID does not exist' });
  }

  await updateDocument(customerGroup, data).save();
  
  return customerGroup;
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const customerGroup = await mongodb.model('customer-group').findById(id, '_id nCustomer');

  if (!customerGroup) {
    throw new NotFoundException({ message: 'Customer group ID does not exist' });
  }

  if (customerGroup.nCustomer) {
    throw new BadRequestException({ 
      code: 'HAS_ASSIGNED_TO_CUSTOMERS',
      message: `This customer group cannot be deleted as it is currently assigned to ${customerGroup.nCustomer} customers!`
    });
  }

  const result = await mongodb.model('customer-group').deleteOne({ "_id": id });

  return {
    expected: 1,
    found: [id],
    deletedCount: result.deletedCount
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

  const docs = await mongodb.model('customer-group')
    .find({ "_id": { "$in": ids } }).select('_id name nCustomer');

  if (!docs.length) {
    throw new NotFoundException({ message: 'Customer group IDs does not exist' });
  }

  for (const group of docs) {
    if (group.nCustomer) {
      throw new BadRequestException({
        code: 'HAS_ASSIGNED_TO_CUSTOMERS',
        message: `Customer group: "${group.name}" cannot be deleted as it is currently assigned to ${group.nCustomer} customers!`
      });
    }
  }

  const found = docs.map(doc => doc._id);

  const result = await mongodb.model('customer-group').deleteMany({ "_id": { "$in": found } }); 
  
  return {
    expected: ids.length,
    found: found,
    deletedCount: result.deletedCount
  };
}
