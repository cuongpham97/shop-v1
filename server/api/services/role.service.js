const validate = require('~utils/validator');
const permissionService = require('./permission.service');
const { mongodb } = require('~database');

const SUPERADMIN_ROLE_LEVEL = 0;

const cache = {

  roles: [],

  ensureCached: async function () {

    if (cache.roles.length) return;
    cache.roles = await mongodb.model('role').find({ active: true });
  },

  findByNames: async function (...names) {
    await this.ensureCached();
  
    return this.roles.filter(role => names.includes(role.name)  );
  },

  getAllPermission: async function (...roleNames) {
    const roles = await this.findByNames(...roleNames);

    const merge = function (o1, o2) {

      for (const [key, value2] of _.entries(o2)) {
        const value1 = o1[key];

        o1[key] = value1 ? [...new Set([...[].concat(value1), ...[].concat(value2)])] : value2;
      }

      return o1;
    }

    const permission = {};

    for (const role of roles) {
      merge(permission, role.permission);
    }
    
    return permission;
  }
};

(async function () {

  mongodb.model('role').watch().on('change', cache.ensureCached);

  const permission = {};

  permissionService.getAllPermission().forEach(p => {
    permission[p.name] = p.action;
  });

  const baseRole = await mongodb.model('role')
    .findOneAndUpdate(
      { name: 'superadmin' },
      {
        name: 'superadmin',
        level: SUPERADMIN_ROLE_LEVEL,
        permission: permission,
        active: true
      }, 
      { new: true, upsert: true }
    );
  
})();

exports.cache = cache;

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

  if (role.level <= SUPERADMIN_ROLE_LEVEL) {
    throw new ValidationException({ message: 'Role level must be greater than ' + SUPERADMIN_ROLE_LEVEL });
  }

  if (role.creator.id) {
    const admin = await mongodb.model('admin').findById(role.creator.id).select('_id displayName');

    if (!admin) {
      throw new NotFoundException({ message: 'Admin ID does not exist' });
    }

    role.creator.name = admin.displayName;
  }

  const newRole = await mongodb.model('role').create(role);

  return newRole;
}

exports.partialUpdate = async function (id, data, updatorId = null) {

  data.id = id;

  data.updator = {
    id: updatorId
  };

  const validation = await validate(data, {
    'id': 'mongo_id',
    'name': 'string|min:1|max:200',
    'level': 'integer',
    'permission': 'object',
    'updator': 'object',
    'updator.id': 'mongo_id',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
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
    throw new BadRequestException({ message: 'Cannot update "superadmin" role' });
  }

  if (data.updator.id) {
    const admin = await mongodb.model('admin').findById(data.updator.id).select('_id displayName');

    if (!admin) {
      throw new NotFoundException({ message: 'Admin ID does not exist' });
    }

    data.creator.name = admin.displayName;
  }

  role = _.merge(role, data);
  await role.save();

  return true;
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const role = await mongodb.model('role').findById(id).select('_id name');

  if (!role) {
    throw new NotFoundException({ message: 'Role ID does not exist' });
  }

  if (role.name === 'superadmin') {
    throw new BadRequestException({ message: 'Cannot delete "superadmin" role' });
  }
  
  await mongodb.model('role').deleteOne({ _id: id });

  return true;
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

  const docs = await mongodb.model('role').find({ _id: { "$in": ids } }).select('_id name');

  if (!docs.length) {
    throw new NotFoundException({ message: 'Role IDs does not exist' });
  }

  docs.forEach(doc => {
    if (doc.name === 'superadmin') {
      throw new BadRequestException({ message: 'Cannot delete "superadmin" role' });
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
