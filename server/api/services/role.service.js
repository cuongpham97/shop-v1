const mongodb = require('~database/mongodb');
const validate = require('~utils/validator');

const cache = { 
  roles: []
};

async function ensureCached() {
  if (!cache.roles.length) {
    cache.roles = await mongodb.model('role').find();
  }
}

(async function () {

  // TODO: ensure superadmin role is exist

  mongodb.model('role').watch().on('change', ensureCached);
})();

exports.getRoleByNames = async function (...names) {
  await ensureCached();
  //TODO
}

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
    throw new ValidationException({ message: validation.errors });
  }

  return await mongodb.model('role').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const role = await mongodb.model('role').findById(id, fields);

  if (!role) {
    throw new NotFoundException({ message: 'Role ID not found' });
  }

  return role;
}

exports.create = async function (role, creatorId = null) {
  
  role.creator = {
    id: creatorId
  };

  const validation = await validate(role, {
    'name': 'required|string|min:1|max:200',
    'level': 'integer',
    'permission': 'object',
    'creator': 'object',
    'creator.id': 'mongo_id',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  role = validation.result;

  // TODO: validate role level;

  if (role.creator.id) {
    const admin = await mongodb.model('admin').findById(role.creator.id).select('_id displayName');

    role.creator.name = admin.displayName;
  }

  const newRole = await mongodb.model('role').create(role);

  return newRole;
}
