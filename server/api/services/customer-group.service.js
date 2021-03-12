const validate = require('~utils/validate');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');
const CustomerGroup = mongodb.model('customer-group');

function _projectDocument(group){
  if (group.toJSON) {
    group = group.toJSON();
  }

  return _.omit(group, ['__v']);
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
  return await CustomerGroup.paginate(query, _projectDocument);
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

exports.findById = async function (id, fields = null) {
  const input = await _filterFindByIdInput({ id, fields });

  const group = await CustomerGroup.findById(input.id, input.fields);
  if (!group) {
    throw new NotFoundException({ 
      message: 'Customer group ID not does not exist' 
    });
  }

  return _projectDocument(group);
}

async function _filterNewGroupInput(input) {
  const validation = await validate(input, {
    'name': 'required|string|min:1|max:200',
    'nCustomer': 'not_allow',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

function _prepareNewGroup(input) {
  return new CustomerGroup(input);
}

exports.create = async function (data) {
  const input = await _filterNewGroupInput(data);
  const newGroup = await _prepareNewGroup(input).save();

  return _projectDocument(newGroup);
} 

async function _filterUpdateGroupInput(input) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'name': 'string|min:1|max:200',
    'nCustomer': 'not_allow',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

function _prepareUpdateGroup(group, input) {
  return updateDocument(group, input);
}

exports.partialUpdate = async function (id, data) {
  const input = await _filterUpdateGroupInput({ id, ...data });

  const group = await CustomerGroup.findById(input.id);
  if (!group) {
    throw NotFoundException({ 
      message: 'Customer group ID does not exist' 
    });
  }

  await _prepareUpdateGroup(group, data).save();

  return _projectDocument(group);
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

exports.deleteById = async function (id) {
  const input = await _filterDeleteByIdInput({ id });

  const group = await CustomerGroup.findById(input.id, '_id nCustomer');
  if (!group) {
    throw new NotFoundException({ 
      message: 'Customer group ID does not exist' 
    });
  }

  if (group.nCustomer) {
    throw new BadRequestException({ 
      code: 'HAS_ASSIGNED_TO_CUSTOMERS',
      message: `This customer group cannot be deleted as it is currently assigned to ${group.nCustomer} customers!`
    });
  }

  const result = await CustomerGroup.deleteOne({ "_id": input.id });

  return {
    expected: 1,
    found: [input.id],
    deletedCount: result.deletedCount
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

exports.deleteMany = async function (ids) {
  const input = await _filterDeleteManyInput({ ids });
 
  const groups = await CustomerGroup.find({ "_id": { "$in": input.ids } }, '_id name nCustomer');
  if (!groups.length) {
    throw new NotFoundException({ 
      message: 'Customer group IDs does not exist' 
    });
  }

  for (const group of groups) {
    if (group.nCustomer) {
      throw new BadRequestException({
        code: 'HAS_ASSIGNED_TO_CUSTOMERS',
        message: `Customer group: "${group.name}" cannot be deleted as it is currently assigned to ${group.nCustomer} customers!`
      });
    }
  }

  const foundIds = groups.map(group => group._id);
  const result = await CustomerGroup.deleteMany({ "_id": { "$in": foundIds } }); 
  
  return {
    expected: input.ids.length,
    found: foundIds,
    deletedCount: result.deletedCount
  };
}
