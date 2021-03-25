const validate = require('~utils/validate');
const permissionService = require('./permission.service');
const cacheService = require('./cacheService');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');
const Role = mongodb.model('role');

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

function _projectDocument(role) {
  if (role.toJSON) {
    role = role.toJSON();
  }

  return _.omit(role, ['__v']);
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
  return await Role.paginate(query, _projectDocument);
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

  const role = await Role.findById(input.id, input.fields);
  if (!role) {
    throw new NotFoundException({ 
      message: 'Role ID not does not exist' 
    });
  }

  return _projectDocument(role);
}

async function _filterNewRoleInput(input) {
  const validation = await validate(input, {
    'name': 'required|string|min:1|max:200',
    'level': 'integer',
    'permission': 'object',
    'creator': 'object',
    'creator._id': 'mongo_id',
    'creator.displayName': 'string',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  if (input.level <= SUPERADMIN_ROLE_LEVEL) {
    throw new ValidationException({ 
      message: 'Role level must be greater than ' + SUPERADMIN_ROLE_LEVEL 
    });
  }

  return validation.result;
}

async function _prepareNewRole(input) {
  const role = new Role(input);

  role.set('creator.name', input.creator.displayName);

  return role;
}

exports.create = async function (data, creator) {
  const input = await _filterNewRoleInput({ ...data, creator });

  const newRole = await _prepareNewRole(input);
  await newRole.save();

  return _projectDocument(newRole);
}

async function _filterUpdateRoleInput(input) {
  const validation = await validate(input, {
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
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  if (input.level <= SUPERADMIN_ROLE_LEVEL) {
    throw new ValidationException({ 
      message: 'Role level must be greater than ' + SUPERADMIN_ROLE_LEVEL 
    });
  }

  return validation.result;
}

async function _prepareUpdateRole(role, input) {
  const clone = { ...input };

  role.set('updator.name', clone.updator.displayName);

  return updateDocument(role, clone);
}

exports.partialUpdate = async function (id, data, updator) {
  const input = await _filterUpdateRoleInput({ id, ...data, updator });

  const role = await Role.findById(input.id);
  if (!role) {
    throw new NotFoundException({ 
      message: 'Role ID does not exist' 
    });
  }

  if (role.name === 'superadmin') {
    throw new BadRequestException({ 
      code: 'CANNOT_BE_CHANGED',
      message: 'Cannot update `superadmin` role' 
    });
  }

  const updated = await _prepareUpdateRole(role, input);
  await updated.save();

  return _projectDocument(updated);
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

  const role = await Role.findById(input.id, '_id name');
  if (!role) {
    throw new NotFoundException({
      message: 'Role ID does not exist' 
    });
  }

  if (role.name === 'superadmin') {
    throw new BadRequestException({
      code: 'CANNOT_BE_DELETED',
      message: 'Cannot delete `superadmin` role' 
    });
  }
  
  const result = await Role.deleteOne({ "_id": input.id });

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

  const roles = await Role.find({ "_id": { "$in": input.ids } }, '_id name');
  if (!roles.length) {
    throw new NotFoundException({ 
      message: 'Role IDs does not exist' 
    });
  }

  for (const role of roles) {
    if (role.name === 'superadmin') {
      throw new BadRequestException({ 
        code: 'CANNOT_BE_DELETED',
        message: 'Cannot delete `superadmin` role' 
      });
    }
  }

  const foundIds = roles.map(role => role._id);

  const result = await Role.deleteMany({ "_id": { "$in": foundIds } }); 

  return {
    expected: input.ids.length,
    found: foundIds,
    deletedCount: result.deletedCount
  };
}
