const validate = require('~utils/validate');
const imageService = require('~services/image.service');
const { updateDocument } = require('~utils/tools');
const { regexes } = require('~utils/constants');
const { mongodb } = require('~database');
const Admin = mongodb.model('admin');
const Image = mongodb.model('image');
const moment = require('moment');

function _projectDocument(admin) {
  if (admin.toJSON) {
    admin = admin.toJSON();
  }

  return _.omit(admin, ['password', '__v']);
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
  return await Admin.paginate(query, _projectDocument);
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

  const admin = await Admin.findById(input.id, input.fields);
  if (!admin) {
    throw new NotFoundException({
      message: 'Admin ID not does not exist'
    });
  }

  return _projectDocument(admin);
}

async function _filterNewAdminInput(input) {
  const validation = await validate(input, {
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20|titlecase',
    'name.last': 'string|trim|min:1|max:20|titlecase',
    'displayName': 'required|string|trim|min:2|max:100|titlecase',
    'gender': ['required', 'lowercase', 'titlecase', 'regex:' + regexes.GENDER],
    'birthday': 'required|date:YYYY/MM/DD',
    'phone': 'string|trim|phone',
    'avatar': 'mongo_id',
    'address': 'location',
    'username': 'required|string|trim|min:6|max:16|lowercase|regex:/^\\w[\\w\\_\\.]+$/',
    'password': 'required|string|min:6|max:16',
    'roles': 'array',
    'roles.*': 'string',
    'active': 'boolean'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

async function _setAvatar(admin, imageId, session) {
  const image = await Image.findById(imageId);
  if (!image) {
    throw new NotFoundException({
      message: 'Avatar image does not exist'
    });
  }

  await imageService.set(imageId, `admin:${admin._id}/avatar`, session);

  admin.set('avatar', image);
}

async function _prepareNewAdmin(input, session) {
  const admin = new Admin(input);

  if (input.avatar) {
    await _setAvatar(admin, input.avatar, session);
  }

  return admin;
}

exports.create = async function (data) {
  const input = await _filterNewAdminInput(data);

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const newAdmin = await _prepareNewAdmin(input, session);
    await newAdmin.save({ session });

    return _projectDocument(newAdmin);
  });
}

async function _filterUpdateAdminInput(input, role) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'name': 'object|nullable',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'string|trim|min:2|max:100',
    'gender': ['lowercase', 'titlecase', 'regex:' + regexes.GENDER],
    'birthday': 'date:YYYY/MM/DD',
    'phone': 'string|nullable|trim|phone',
    'avatar': 'mongo_id|nullable',
    'address': 'location|nullable',
    'username': 'not_allow',
    'password': 'not_allow',
    'roles': role === 'superadmin' ? 'array' : 'not_allow',
    'roles.*': 'string',
    'active': role === 'superadmin' ? 'boolean' : 'not_allow'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

async function _changeAvatar(admin, newImageId, session) {
  const oldImage = admin.avatar && admin.avatar._id;
  const newImage = newImageId;
  const isChange = !ObjectId(oldImage).equals(newImage);

  admin.avatar = null;

  if (isChange && newImage) {
    admin.avatar = await Image.findById(newImage);

    if (!admin.avatar) {
      throw new NotFoundException({ 
        message: 'Avatar image ID does not exist' 
      });
    }

    await imageService.set(newImage, `admin:${admin._id}/avatar`, session);
  }

  if (isChange && oldImage) {
    await imageService.unset(oldImage._id, `admin:${admin._id}/avatar`, session);
  }

  return admin;
}

async function _prepareUpdateAdmin(admin, input, session) {
  const clone = { ...input };

  if ('avatar' in input) {
    await _changeAvatar(admin, clone.avatar, session);
    delete clone.avatar;
  }

  return updateDocument(admin, clone);
}

/**
 * @param {string} id 
 * @param {object} data 
 * @param {('admin'|'superadmin')} role 
 */
exports.partialUpdate = async function (id, data, role = 'admin') {
  const input = await _filterUpdateAdminInput({ id, ...data }, role);

  const admin = await Admin.findById(input.id);
  if (!admin) {
    throw new NotFoundException({
      message: 'Admin ID not does not exist'
    });
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const updated = await _prepareUpdateAdmin(admin, input, session);
    await updated.save({ session });

    return _projectDocument(updated);
  });
}

async function _filterChangePasswordInput(input, role) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'password': role === 'admin' ? 'required|string|min:6|max:16' : 'unset',
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
 * @param {('admin'|'superadmin')} role 
 */
exports.changePassword = async function (id, data, role = 'admin') {
  const input = await _filterChangePasswordInput({ id, ...data }, role);

  const admin = await Admin.findById(input.id);
  if (!admin) {
    throw new NotFoundException({ 
      message: 'Admin ID does not exist' 
    });
  }

  const match = role === 'superadmin'
    ? true
    : await admin.comparePassword(input.password);

  if (!match) {
    throw new AuthenticationException({ 
      message: 'Password is incorrect'
    });
  }

  const update = {
    "password": input.newPassword,
    "tokenVersion": moment().valueOf()
  };

  await updateDocument(admin, update).save();

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

async function _unsetAvatar(admin) {
  if (admin.avatar) {
    await imageService.unset(admin.avatar._id, `admin:${admin._id}/avatar`);
  }

  admin.set('avatar', null);
}

exports.deleteById = async function (id) {
  const input = await _filterDeleteByIdInput({ id });

  const admin = await Admin.findByIdAndDelete(input.id).select('_id avatar');
  if (!admin) {
    throw new NotFoundException({ 
      message: 'Admin ID does not exist' 
    });
  }

  await _unsetAvatar(admin);

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

async function _unsetAvatars(adminsArray) {
  const images = adminsArray.map(admin => admin.avatar && admin.avatar._id).filter(Boolean);
  
  await imageService.unsetMany(images, adminsArray.map(admin => `admin:${admin._id}/avatar`));
}

exports.deleteMany = async function (ids) {
  const input = await _filterDeleteManyInput({ ids });

  const admins = await Admin.find({ "_id": { "$in": input.ids } }, '_id avatar');
  if (!admins.length) {
    throw new NotFoundException({ 
      message: 'Admin IDs does not exist' 
    });
  }

  const foundIds = admins.map(admin => admin._id);
  const result = await Admin.deleteMany({ "_id": { "$in": foundIds } });

  await _unsetAvatars(admins);

  return {
    expected: input.ids.length,
    found: foundIds,
    deletedCount: result.deletedCount
  };
}
