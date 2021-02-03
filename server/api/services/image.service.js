const { mongodb } = require('~database');
const validate = require('~utils/validator');
const upload = require('~utils/upload');
const report = require('~utils/report');

exports.model = mongodb.model('image');

exports.upload = async function (data) {

  const validation = await validate(data, {
    'name': 'string|trim|max:200',
    'image': 'required|string',
    'description': 'string|trim|max:500'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  data = validation.result;

  const image = await upload.uploadImage(data.image, data.name, data.description);

  const newImage = await mongodb.model('image').create(image);

  return newImage;
}

exports.deleteById = async function (id, isSync = true) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const image = await mongodb.model('image').findByIdAndDelete(id);

  if (!image) {
    throw new NotFoundException({ message: 'Image ID does not exist' });
  }

  isSync ? await upload.deleteImage(image) : upload.deleteImage(image).catch(e => report.error(e));

  return true;
}

exports.set = async function (id, usedFor) {

  const result = await mongodb.model('image').updateOne(
    { "_id": id }, 
    { "$addToSet": { "usedFor": usedFor } }
  );

  if (!result.n) {
    throw new NotFoundException({ message: 'Image ID does not exist' });
  }

  return result.nModified;
}

exports.unset = async function (id, unusedFor) {

  const result = await mongodb.model('image').updateOne(
    { "_id": id },
    { "$pull": { "usedFor": unusedFor } }
  );

  if (!result.n) {
    throw new NotFoundException({ message: 'Image ID does not exist' });
  }
  
  return result.nModified;
}

exports.unsetMany = async function (ids, matches) {

  const result = await mongodb.model('image').updateMany(
    { "_id": { "$in": ids } },
    { "$pull": { "usedFor": { "$in": matches } } }
  );

  return result.nModified;
}
