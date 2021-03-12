const validate = require('~utils/validate');
const cacheService = require('./cacheService');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');

function _buildCategoriesTree(categories) {
  const groupByParent = _.groupBy(categories, item => _.last(item.ancestors));

    function _getChildren(parent) {
      if (!groupByParent[parent]) return [];

      return groupByParent[parent].map(item => {
        return {
          _id: item._id,
          name: item.name,
          children: _getChildren(item._id)
        };
      });
    }

    return _getChildren();
}

function _isCached() {
  return cacheService.has('categories') && cacheService.has('categoriesTree');
}

async function _updateCache() {
  const categories = await mongodb.model('category').find();
  cacheService.set('categories', categories);

  const categoriesTree = _buildCategoriesTree(categories);
  cacheService.set('categoriesTree', categoriesTree);
}

async function _ensureCached() {
  if (!_isCached()) {
    await _updateCache();
  }
}

exports.findByIdsFromCache = async function (ids) {
  await _ensureCached();

  const categories = ids.map(id => cacheService.get('categories').find(item => item._id.equals(id)));
  return _.cloneDeep(categories);
}

exports.getAllFromCache = async function () {
  await _ensureCached();

  return _.cloneDeep(cacheService.get('categories'));
}

exports.getCategoriesTreeFromCache = async function () {
  await _ensureCached();

  return _.cloneDeep(cacheService.get('categoriesTree'));
}

!(async function () {
  mongodb.model('category').watch().on('change', _updateCache);
})();

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

  return await mongodb.model('category').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.first() });
  }

  id = validation.result.id;

  const category = await mongodb.model('category').findById(id, fields);

  if (!category) {
    throw new NotFoundException({ message: 'Category ID not does not exist' });
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
    throw new ValidationException({ message: validation.errors.toArray() });
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
    'parent': 'mongo_id|nullable',
    'order': 'integer',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {

    const category = await mongodb.model('category').findById(id);

    if (!category) {
      throw new NotFoundException({ message: 'Category ID does not exist' });
    }
  
    if ('parent' in data) {
  
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

    return category;
  });
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.first() });
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
    const result = await mongodb.model('category').deleteMany({ "_id": { "$in": children } }, { session });

    return {
      expected: 1,
      found: [id],
      dependent: children,
      deletedCount: result.deletedCount + 1
    };
  });
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
  
    const result = await mongodb.model('category')
      .deleteMany({ "_id": { "$in": found.concat(children) } }, { session });

    return {
      expected: ids.length,
      found: found,
      dependent: children,
      deletedCount: result.deletedCount
    };
  });
}
