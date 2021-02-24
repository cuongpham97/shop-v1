const cacheService = require('./cacheService');
const permissionService = require('./permission.service');
const validate = require('~utils/validate');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');

const SUPERADMIN_ROLE_LEVEL = 0;

function _isCached() {
  return cacheService.has('roles');
}

async function _updateCache() {
  const roles = await mongodb.model('role').find({ active: true }); 
  cacheService.set('roles', roles); 
}

async function _ensureCached() {
  if (!_isCached()) {
    await _updateCache();
  }
}

exports.findByNamesFromCache = async function (...names) {
  await _ensureCached();

  const roles = cacheService.get('roles').filter(role => names.includes(role.name));
  return _.cloneDeep(roles);
}

function _mergePermission(o1, o2) {
  for (const [key, value2] of _.entries(o2)) {
    const value1 = o1[key];

    o1[key] = value1 ? [...new Set([...[].concat(value1), ...[].concat(value2)])] : value2;
  }

  return o1;
}

exports.getPermissionByRoleNames = async function (...rolesName) {
  const roles = await this.findByNamesFromCache(...rolesName);

  const permission = {};

  for (const role of roles) {
    _mergePermission(permission, role.permission);
  }

  return permission;
}

async function _ensureBaseRoleAlwayExist() {
  const highestPermission = {};

  permissionService.getAllPermission().forEach(p => {
    highestPermission[p.name] = p.action;
  });

  const baseRole = await mongodb.model('role')
    .findOneAndUpdate(
      { name: 'superadmin' },
      {
        name: 'superadmin',
        level: SUPERADMIN_ROLE_LEVEL,
        permission: highestPermission,
        active: true
      }, 
      { new: true, upsert: true }
    );

  return baseRole;
}

!(async function () {
  await _ensureBaseRoleAlwayExist();
  mongodb.model('role').watch().on('change', _updateCache);
})();

exports.model = mongodb.model('role');

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
    throw new BadRequestException({ 
      code: 'WRONG_QUERY_PARAMETERS', 
      message: 'Query string parameter `' + validation.errors.keys().join(', ') + '` is invalid' 
    });
  }

  return await mongodb.model('role').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.first() });
  }

  id = validation.result.id;

  const role = await mongodb.model('role').findById(id, fields);

  if (!role) {
    throw new NotFoundException({ message: 'Role ID not does not exist' });
  }

  return role;
}

exports.create = async function (role, creator = null) {
  
  role.creator = {
    _id: creator._id,
    name: creator.displayName
  };

  const validation = await validate(role, {
    'name': 'required|string|min:1|max:200',
    'level': 'integer',
    'permission': 'object',
    'creator': 'object',
    'creator._id': 'mongo_id',
    'creator.name': 'string',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  role = validation.result;

  if (role.level <= SUPERADMIN_ROLE_LEVEL) {
    throw new ValidationException({ message: 'Role level must be greater than ' + SUPERADMIN_ROLE_LEVEL });
  }

  const newRole = await mongodb.model('role').create(role);

  return newRole;
}

exports.partialUpdate = async function (id, data, updator) {

  data.id = id;

  data.updator = {
    id_: updator._id,
    name: updator.displayName
  };

  const validation = await validate(data, {
    'id': 'mongo_id',
    'name': 'string|min:1|max:200',
    'level': 'integer',
    'permission': 'object',
    'updator': 'object',
    'updator._id': 'mongo_id',
    'updator.name': 'string',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  if (data.level <= SUPERADMIN_ROLE_LEVEL) {
    throw new ValidationException({ message: 'Role level must be greater than ' + SUPERADMIN_ROLE_LEVEL });
  }

  let role = await mongodb.model('role').findById(id);

  if (!role) {
    throw new NotFoundException({ message: 'Role ID does not exist' });
  }

  if (role.name === 'superadmin') {
    throw new BadRequestException({ 
      code: 'CANNOT_BE_CHANGED',
      message: 'Cannot update `superadmin` role' 
    });
  }

  await updateDocument(role, data).save();

  return true;
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.first() });
  }

  id = validation.result.id;

  const role = await mongodb.model('role').findById(id).select('_id name');

  if (!role) {
    throw new NotFoundException({ message: 'Role ID does not exist' });
  }

  if (role.name === 'superadmin') {
    throw new BadRequestException({
      code: 'CANNOT_BE_DELETED',
      message: 'Cannot delete "superadmin" role' 
    });
  }
  
  const result = await mongodb.model('role').deleteOne({ _id: id });

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
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  ids = validation.result.ids;

  const docs = await mongodb.model('role').find({ _id: { "$in": ids } }).select('_id name');

  if (!docs.length) {
    throw new NotFoundException({ message: 'Role IDs does not exist' });
  }

  docs.forEach(doc => {
    if (doc.name === 'superadmin') {
      throw new BadRequestException({ 
        code: 'CANNOT_BE_DELETED',
        message: 'Cannot delete "superadmin" role' 
      });
    }  
  });

  const found = docs.map(doc => doc._id);

  const result = await mongodb.model('role').deleteMany({ _id: { "$in": found } }); 

  return {
    expected: ids.length,
    found: found,
    deletedCount: result.deletedCount
  };
}
