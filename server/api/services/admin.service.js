const validate = require('~utils/validate');
const imageService = require('~services/image.service');
const { updateDocument } = require('~utils/tools');
const { regexes } = require('~utils/constants');
const { mongodb } = require('~database');
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
    throw new BadRequestException({ 
      code: 'WRONG_QUERY_PARAMETERS', 
      message: 'Query string parameter `' + validation.errors.keys().join(', ') + '` is invalid' 
    });
  }

  return await mongodb.model('admin').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {
  
  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ 
      code: 'WRONG_QUERY_PARAMS',
      message: validation.errors.first()
    });
  }

  id = validation.result.id;

  const admin = await mongodb.model('admin').findById(id, fields);

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID not does not exist' });
  }

  return admin;
}

exports.create = async function (admin) {

  const validation = await validate(admin, {
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20|titlecase',
    'name.last': 'string|trim|min:1|max:20|titlecase',
    'displayName': 'required|string|trim|min:2|max:100|titlecase',
    'gender': ['required', 'lowercase', 'titlecase', 'regex:' + regexes.GENDER],
    'birthday': 'required|date:YYYY/MM/DD',
    'phone': 'string|trim|phone',
    'avatar': 'mongo_id',
    'address': 'object',
    'address.block': 'required_with:address|string|trim|min:1|max:100',
    'address.district': 'required_with:address|string|trim|min:1|max:100',
    'address.province': 'required_with:address|string|trim|min:1|max:100',
    'username': 'required|string|trim|min:6|max:16|lowercase|regex:/^\\w[\\w\\_\\.]+$/',
    'password': 'required|string|min:6|max:16',
    'roles': 'array',
    'roles.*': 'string',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  admin = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {
    
    admin._id = ObjectId();

    if (admin.avatar) {
      const image = await mongodb.model('image').findById(admin.avatar);

      if (!image) {
        throw new NotFoundException({ message: 'Avatar image ID does not exist' });
      }
    
      admin.avatar = image;

      await imageService.set(image._id, `admin:${admin._id}/avatar`, session);
    }
   
    const [newAdmin] = await mongodb.model('admin').create([admin], { session });

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
    'name': 'object|nullable',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'string|trim|min:2|max:100',
    'gender': ['lowercase', 'titlecase', 'regex:' + regexes.GENDER],
    'birthday': 'date:YYYY/MM/DD',
    'phone': 'string|nullable|trim|phone',
    'avatar': 'mongo_id|nullable',
    'address': 'object|nullable',
    'address.block': 'required_with:address|string|trim|min:1|max:100',
    'address.district': 'required_with:address|string|trim|min:1|max:100',
    'address.province': 'required_with:address|string|trim|min:1|max:100',
    'username': 'not_allow',
    'password': 'not_allow',
    'roles': role === 'superadmin' ? 'array' : 'not_allow',
    'roles.*': 'string',
    'active': role === 'superadmin' ? 'boolean' : 'not_allow'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {

    let admin = await mongodb.model('admin').findById(id);

    if (!admin) {
      throw new NotFoundException({ message: 'Admin ID not does not exist' });
    }

    if ('avatar' in data) {

      const oldImage = admin.avatar && admin.avatar._id;
      const newImage = data.avatar;
      const isChange = !ObjectId(oldImage).equals(newImage);

      if (isChange && newImage) {
        data.avatar = await mongodb.model('image').findById(newImage);

        if (!data.avatar) {
          throw new NotFoundException({ message: 'Avatar image ID does not exist' });
        }

        await imageService.set(newImage._id, `admin:${admin._id}/avatar`, session);
      }
      
      if (isChange && oldImage) {
        await imageService.unset(oldImage._id, `admin:${admin._id}/avatar`, session);
      }
    }

    await updateDocument(admin, data).save({ session });
  
    return admin;
  });
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
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  id = validation.result.id;

  let admin = await mongodb.model('admin').findById(id);

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID does not exist' });
  }

  const match = role === 'superadmin' 
    ? true
    : await admin.comparePassword(validation.result.password);
  
  if (!match) {
    throw new AuthenticationException({ message: 'Password is incorrect' });
  }

  const update = { 
    "password": validation.result.newPassword,
    "tokenVersion": moment().valueOf()
  };

  await updateDocument(admin, update).save();
  
  return true;
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.first() });
  }

  id = validation.result.id;

  const admin = await mongodb.model('admin').findByIdAndDelete(id).select('_id avatar');

  if (!admin) {
    throw new NotFoundException({ message: 'Admin ID does not exist' });
  }

  const image = admin.avatar;

  if (image) {
    await imageService.unset(image._id, `admin:${admin._id}/avatar`);
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
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  ids = validation.result.ids;

  const docs = await mongodb.model('admin').find({ "_id": { "$in": ids } }).select('_id avatar');

  if (!docs.length) {
    throw new NotFoundException({ message: 'Admin IDs does not exist' });
  }

  const found = docs.map(doc => doc._id);
  const images = docs.map(doc => doc.avatar && doc.avatar._id).filter(Boolean);

  const result = await mongodb.model('admin').deleteMany({ "_id": { "$in": found } }); 

  await imageService.unsetMany(images, found.map(id => `admin:${id}/avatar`));
  
  return {
    expected: ids.length,
    found: found,
    deletedCount: result.deletedCount
  };
}
