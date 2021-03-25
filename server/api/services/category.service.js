const validate = require('~utils/validate');
const cacheService = require('./cacheService');
const { updateDocument } = require('~utils/tools');
const { mongodb } = require('~database');
const Category = mongodb.model('category');

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

function _projectDocument(category) {
  if (category.toJSON) {
    category = category.toJSON();
  }

  return _.omit(category, ['__v']);
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

  const dataset = await Category.paginate(query, _projectDocument);
  
  if ('populate' in query) {
    dataset.data = await Category.populate(dataset.data, { 
      path: 'ancestors', 
      select: "_id name"
    });
  }

  return dataset;
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

exports.findById = async function (id, fields = []) {
  const input = await _filterFindByIdInput({ id, fields });

  const category = await Category.findById(input.id, input.fields);
  if (!category) {
    throw new NotFoundException({
      message: 'Category ID not does not exist'
    });
  }

  return _projectDocument(category);
}

async function _filterNewCategoryInput(input) {
  const validation = await validate(input, {
    'name': 'required|string|trim|min:1|max:200',
    'parent': 'mongo_id',
    'order': 'integer',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

async function _assignParent(category, parentId) {
  const parent = await Category.findById(parentId);
  if (!parent) {
    throw new NotFoundException({
      message: 'Category parent ID does not exist'
    });
  }

  category.ancestors = parent.ancestors.concat(parent.id);
}

async function _prepareNewCategory(input) {
  const category = new Category(input);

  if (input.parent) {
    await _assignParent(category, input.parent);
  }

  return category;
}

exports.create = async function (data) {
  const input = await _filterNewCategoryInput(data);
  const newCategory = await _prepareNewCategory(input);
  await newCategory.save();

  return _projectDocument(newCategory);
}

async function _filterUpdateCategoryInput(input) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'name': 'string|trim|min:1|max:200',
    'parent': 'mongo_id|nullable',
    'order': 'integer',
    'description': 'string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.toArray()
    });
  }

  return validation.result;
}

async function _updateAncesstorsOfChildren(category, session) {
  await Catgory.updateMany({ "ancestors": category._id }, [
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
}

async function _changeParent(category, newParentId, session) {
  category.ancestors = [];

  if (newParentId) {
    const parent = await Category.findById(newParentId);
    if (!parent) {
      throw new NotFoundException({
        message: 'Category parent ID does not exist'
      });
    }

    category.ancestors = parent.ancestors.concat(parent.id);
  }

  await _updateAncesstorsOfChildren(category, session);
}

async function _prepareUpdateCategory(category, input) {
  const clone = { ...input };

  if ('parent' in input) {
    await _changeParent(category, clone.parent);
    delete clone.parent;
  }

  return updateDocument(category, clone);
}

exports.partialUpdate = async function (id, data) {
  const input = await _filterUpdateCategoryInput({ id, ...data });

  const category = await Category.findById(input.id);
  if (!category) {
    throw new NotFoundException({
      message: 'Category ID does not exist'
    });
  }

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const updated = await _prepareUpdateCategory(category, input, session);
    await updated.save({ session });

    return _projectDocument(updated);
  });
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

async function _deleteChildren(category, session) {
  const children = await Category.find({ "ancestors": category._id }, '_id');

  const ids = children.map(child => child._id);
  const result = await Category.deleteMany({ "_id": { "$in": ids } }, { session });

  return {
    found: ids,
    deletedCount: result.deletedCount
  }
}

exports.deleteById = async function (id) {
  const input = await _filterDeleteByIdInput({ id });

  return await mongodb.transaction(async function (session, _commit, _abort) {

    const category = await Category.findByIdAndDelete(input.id, { session });
    if (!category) {
      throw new NotFoundException({
        message: 'Category ID does not exist'
      });
    }

    const deletedChildren = await _deleteChildren(category, session);

    return {
      expected: 1,
      found: [input.id],
      dependent: deletedChildren.found,
      deletedCount: deletedChildren.deletedCount + 1
    };
  });
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

exports.deleteMany = async function (ids) {
  const input = await _filterDeleteManyInput({ ids });

  let [{ found, children }] = await Category.aggregate([
    {
      "$facet": {
        "categories": [
          { "$match": { "_id": { "$in": input.ids } } },
          { "$group": { "_id": null, "ids": { "$push": "$_id" } } }
        ],
        "children": [
          { "$match": { "ancestors": { "$elemMatch": { "$in": input.ids } } } },
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
    throw new NotFoundException({
      message: 'Category IDs does not exist'
    });
  }

  children = _.filter(children || [], child => found.every(id => !id.equals(child)));

  const result = await Category.deleteMany({ "_id": { "$in": found.concat(children) } });

  return {
    expected: input.ids.length,
    found: found,
    dependent: children,
    deletedCount: result.deletedCount
  };
}
