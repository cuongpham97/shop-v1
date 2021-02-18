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

exports.set = async function (id, usedFor, session = null) {

  const result = await mongodb.model('image').updateOne(
    { "_id": id }, 
    { "$addToSet": { "related": usedFor } },
    { session }
  );

  if (!result.n) {
    report.error(new Error(`Trying to set "${usedFor}", image "${id}" not found`));
  }

  return result;
}

exports.unset = async function (id, unusedFor, session = null) {

  const result = await mongodb.model('image').updateOne(
    { "_id": id },
    { "$pull": { "related": unusedFor } },
    { session }
  );

  if (!result.n) {
    report.error(new Error(`Trying to unset "${unusedFor}", image "${id}" not found`));
  }

  return result;
}

exports.setMany = async function (ids, usedFor, session = null) {

  const result = await mongodb.model('image').updateMany(
    { "_id": { "$in": ids } },
    { "$addToSet": { "related": usedFor } },
    { session }
  );

  if (ids.length !== result.n) {
    report.error(new Error(`Trying to set "${usedFor}", number of images "${ids}" is not matches`));
  }

  return result;
}

exports.unsetMany = async function (ids, matches, session = null) {

  const result = await mongodb.model('image').updateMany(
    { "_id": { "$in": ids } },
    { "$pull": { "related": { "$in": matches } } },
    { session }
  );

  if (ids.length !== result.n) {
    report.error(new Error(`Trying to unset "${matches}", number of images "${ids}" is not matches`));
  }

  return result;
}
