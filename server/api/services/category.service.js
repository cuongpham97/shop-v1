const validate = require('~utils/validator');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');

exports.model = mongodb.model('category');

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

  return await mongodb.model('category').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const category = await mongodb.model('category').findById(id, fields);

  if (!category) {
    throw new NotFoundException({ message: 'Category ID not found' });
  }

  return category;
}

exports.create = async function (category) {

  const validation = await validate(category, {
    'name': 'required|string|trim|min:1|max:200',
    'parent': 'mongo_id',
    'order': 'integer',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  category = validation.result;

  if (category.parent) {
    const parent = await mongodb.model('category').findById(category.parent);

    if (!parent) {
      throw new NotFoundException({ message: 'Category parent ID does not exist' });
    }

    category.ancestors = parent.ancestors.concat(parent.id);
  }

  const newCategory = await mongodb.model('category').create(category);

  return newCategory;
}

exports.partialUpdate = async function (id, data) {

  data.id = id;

  const validation = await validate(data, {
    'id': 'mongo_id',
    'name': 'string|trim|min:1|max:200',
    'parent': 'mongo_id',
    'order': 'integer',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  let category = await mongodb.model('category').findById(id);

  if (!category) {
    throw new NotFoundException({ message: 'Category ID does not exist' });
  }

  if (_.has(data, 'parent')) {

    let parent = null;
    data.ancestors = [];

    if (data.parent) {
      parent = await mongodb.model('category').findById(data.parent);

      if (!parent) {
        throw new NotFoundException({ message: 'Category parent ID does not exist' });
      }

      data.ancestors = parent.ancestors.concat(parent.id);
    }
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {

    await updateDocument(category, data).save({ session });

    // Update ancestors of children
    await mongodb.model('category').updateMany({ "ancestors": category._id }, [
      {
        "$set": {
          "ancestors": {
            "$let": {
              "vars": {
                "indexOf": { "$indexOfArray": ["$ancestors", category._id] },
                "sizeOf": { "$size": "$ancestors" }
              },
              "in": {
                "$concatArrays": [
                  category.ancestors,
                  { "$slice": ["$ancestors", { "$subtract": ["$$indexOf", "$$sizeOf"] }] }
                ]
              }
            }
          }
        }
      }
    ], { session });

    return true;
  });
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  return await mongodb.transaction(async function (session, _commit, _abort) {

    const category = await mongodb.model('category').findByIdAndDelete(id, { session });

    if (!category) {
      throw new NotFoundException({ message: 'Category ID does not exist' });
    }

    let children = await mongodb.model('category').find({ "ancestors": id }).select("_id");
    children = children.map(doc => doc._id);

    // Delete children
    const state = await mongodb.model('category').deleteMany({ "_id": { "$in": children } }, { session });

    return {
      expected: 1,
      found: [id],
      dependent: children,
      deletedCount: state.deletedCount + 1
    };
  });
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

  return await mongodb.transaction(async function (session, _commit, _abort) {

    let [{ found, children }] = await mongodb.model('category').aggregate([
      {
        "$facet": {
          "categories": [
            { "$match": { "_id": { "$in": ids } } },
            { "$group": { "_id": null, "ids": { "$push": "$_id" } } }
          ],
          "children": [
            { "$match": { "ancestors": { "$elemMatch": { "$in": ids } } } },
            { "$group": { "_id": null, "ids": { "$push": "$_id" } } }
          ]
        }
      },
      { "$unwind": { "path": "$categories", "preserveNullAndEmptyArrays": true } },
      { "$unwind": { "path": "$children", "preserveNullAndEmptyArrays": true } },
      {
        "$project": {
          "found": "$categories.ids",
          "children": "$children.ids"
        }
      }
    ]);

    if (!found) {
      throw new NotFoundException({ message: 'Category IDs does not exist' });
    }

    children = _.filter(children || [], child => found.every(id => !id.equals(child)));
  
    const state = await mongodb.model('category')
      .deleteMany({ "_id": { "$in": found.concat(children) } }, { session });

    return {
      expected: ids.length,
      found: found,
      dependent: children,
      deletedCount: state.deletedCount
    };
  });
}
