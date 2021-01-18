const mongodb = require('~database/mongodb');
const validate = require('~utils/validator');
const _ = require('lodash');
const { regexes } = require('~utils/constants');
const upload = require('~utils/upload');
const { ValidationException, NotFoundException, BadRequestException } = require('~exceptions');

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

  return await mongodb.model('user').paginate(validation.result);
}

exports.findById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const user = await mongodb.model('user').findById(id);

  if (!user) {
    throw new NotFoundException({ message: 'User ID not found' });
  }

  return user;
}

exports.create = async function (user, provider = 'local') {

  const rule = {
    'name': 'object',
    'name.first': 'string|trim|min:1|max:20',
    'name.last': 'string|trim|min:1|max:20',
    'displayName': 'required|string|trim|min:2|max:100',
    'gender': ['required', 'lowercase', 'regex:' + regexes.GENDER],
    'birthday': 'date:YYYY/MM/DD',
    'phones': 'to:array',
    'phones.*': 'string|trim|phone',
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

  const validation = await validate(user, _.merge(rule, providerRules[provider]));

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  user = validation.result;

  if (!user.avatar) {
    return await mongodb.model('user').create(user);
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {
    
    const imageData = user.avatar;
    _.unset(user, 'avatar');

    let [newUser] = await mongodb.model('user')
      .create([user], { session: session });

    const image = await upload.uploadImage(imageData, user.displayName + ' avatar');

    newUser = await mongodb.model('user').findByIdAndUpdate(newUser.id, {
      avatar: image
    }, { new: true, session: session });

    return newUser;
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

  let user = await mongodb.model('user').findById(id);

  if (!user) {
    throw new NotFoundException({ message: 'User ID not found' });
  }
  
  if (data.avatar) {
    const newImage = await upload.uploadImage(data.avatar, user.displayName + ' avatar');

    const oldImage = user.avatar;
    if (oldImage) await upload.deleteImage(oldImage);

    data.avatar = newImage;
  }

  user = _.merge(user, data);
  await user.save();

  return true;
}

exports.changePassword = async function (id, data, role = 'user') {

  data.id = id;

  const rules = {
    'id': 'mongo_id',
    'password': 'required|string|min:6|max:16',
    'newPassword': 'required|string|min:6|max:16'
  };

  if (role === 'admin') _.unset(rules.password);

  const validation = await validate(data, rules);

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  let user = await mongodb.model('user').findById(id);

  if (!user) {
    throw new NotFoundException({ message: 'User ID not found' });
  }

  if (!user.local) {
    throw new BadRequestException({ message: 'User does not use local provider' });
  }

  const match = role === 'admin' 
    ? true 
    : await user.comparePassword(validation.result.password);

  if (!match) {
    throw new ValidationException({ message: 'Password is incorrect' });
  }

  user = _.merge(user, { local: { password: validation.result.newPassword } });
  await user.save();

  return true;
}

exports.deleteById = async function (id) {
  
  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const result = await mongodb.model('user').deleteOne({ _id: id });

  if (!result.deletedCount) {
    throw new NotFoundException({ message: 'User ID does not exist' });
  }

  return true;
}

exports.deleteMany = async function (ids) {
  
  const validation = await validate({ 'ids': ids }, {
    'ids': 'to:array',
    'ids.*': 'mongo_id'
  });

  if (validate.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  ids = validation.result.ids;

  const found = await mongodb.model('user').find({ _id: { "$in": ids } }).select('_id');

  const result = await mongodb.model('user').deleteMany({ _id: { "$in": found } }); 

  if (!result.deletedCount) {
    throw new NotFoundException({ message: 'User IDs does not exist' });
  }

  return {
    expected: ids.length,
    found: found,
    deletedCount: 0
  };
}
