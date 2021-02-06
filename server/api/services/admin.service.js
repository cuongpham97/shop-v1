const validate = require('~utils/validator');
const imageService = require('~services/image.service');
const { mongodb } = require('~database');
const { regexes } = require('~utils/constants');
const moment = require('moment');

exports.model = mongodb.model('admin');

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

  return await mongodb.model('admin').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {
  
  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const admin = await mongodb.model('admin').findById(id, fields);

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID not found' });
  }

  return admin;
}

exports.create = async function (admin) {

  const validation = await validate(admin, {
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'required|string|trim|min:2|max:100',
    'gender': ['required', 'lowercase', 'regex:' + regexes.GENDER],
    'birthday': 'required|date:YYYY/MM/DD',
    'phones': 'string|trim|phone',
    'avatar': 'mongo_id',
    'address': 'object',
    'address.block': 'required_with:address|string|trim|min:1|max:100',
    'address.district': 'required_with:address|string|trim|min:1|max:100',
    'address.province': 'required_with:address|string|trim|min:1|max:100',
    'username': 'required|string|trim|min:6|max:16|regex:/^\\w[\\w\\_\\.]+$/',
    'password': 'required|string|min:6|max:16',
    'roles': 'array',
    'roles.*': 'string',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  admin = validation.result;

  if (!admin.avatar) {
    return await mongodb.model('admin').create(admin);
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {
    
    const image = await mongodb.model('image').findById(admin.avatar);

    if (!image) {
      throw new NotFoundException({ message: 'Avatar image ID does not exist' });
    }
  
    admin.avatar = image;

    const [newAdmin] = await mongodb.model('admin').create([admin], { session: session });

    await imageService.set(image._id, `admin/${newAdmin.id}/avatar`);

    return newAdmin;
  });
} 

/**
 * @param {string} id 
 * @param {object} data 
 * @param {('admin'|'superadmin')} role 
 */
exports.partialUpdate = async function (id, data, role = 'admin') {

  data.id = id;

  const validation = await validate(data, {
    'id': 'mongo_id',
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'string|trim|min:2|max:100',
    'gender': ['lowercase', 'regex:' + regexes.GENDER],
    'birthday': 'date:YYYY/MM/DD',
    'phones': 'string|trim|phone',
    'avatar': 'mongo_id',
    'address': 'object',
    'address.block': 'required_with:address|string|trim|min:1|max:100',
    'address.district': 'required_with:address|string|trim|min:1|max:100',
    'address.province': 'required_with:address|string|trim|min:1|max:100',
    'username': 'not_allow',
    'password': 'not_allow',
    'roles': 'array',
    'roles.*': 'string',
    'active': role === 'superadmin' ? 'boolean' : 'unset'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  let admin = await mongodb.model('admin').findById(id);

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID not found' });
  }

  if (_.has(data, 'avatar')) {

    let newImage = null;

    if (data.avatar) {
      newImage = await mongodb.model('image').findById(data.avatar);

      if (!newImage) {
        throw new NotFoundException({ message: 'Avatar image ID does not exist' });
      }

      await imageService.set(newImage._id, `admin/${admin._id}/avatar`);
    }

    data.avatar = newImage;

    const oldImage = admin.avatar;
    const isChange = oldImage && (!newImage || !oldImage._id.equals(newImage._id));

    if (isChange) {
      await imageService.unset(oldImage._id, `admin/${admin._id}/avatar`);
    }
  }

  admin = _.merge(admin, data);
  await admin.save();

  return true;
}

/**
 * @param {string} id 
 * @param {object} data 
 * @param {('admin'|'superadmin')} role 
 */
exports.changePassword = async function (id, data, role = 'admin') {

  data.id = id;

  const rules = {
    'id': 'mongo_id',
    'password': role === 'admin' ? 'required|string|min:6|max:16' : 'unset',
    'newPassword': 'required|string|min:6|max:16'
  };

  const validation = await validate(data, rules);

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  let admin = await mongodb.model('admin').findById(id);

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID not found' });
  }

  const match = role === 'superadmin' 
    ? true
    : await admin.comparePassword(validation.result.password);
  
  if (!match) {
    throw new AuthenticationException({ message: 'Password is incorrect' })
  }

  const update = { 
    "password": validation.result.newPassword,
    "tokenVersion": moment().valueOf()
  };

  admin = _.merge(admin, update);

  await admin.save();
  
  return true;
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const admin = await mongodb.model('admin').findByIdAndDelete(id).select('_id avatar');

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID does not exist' });
  }

  const image = admin.avatar;

  if (image) {
    await imageService.unset(image._id, `admin/${admin.id}/avatar`);
  }

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

  const docs = await mongodb.model('admin').find({ "_id": { "$in": ids } }).select('_id avatar');

  if (!docs.length) {
    throw new NotFoundException({ message: 'Admin IDs does not exist' });
  }

  const found = docs.map(doc => doc._id);
  const images = docs.map(doc => doc.avatar && doc.avatar._id).filter(Boolean);

  const result = await mongodb.model('admin').deleteMany({ "_id": { "$in": found } }); 

  await imageService.unsetMany(images, found.map(id => `admin/${id}/avatar`));
  
  return {
    expected: ids.length,
    found: found,
    deletedCount: result.deletedCount
  };
}
