const validate = require('~utils/validate');
const imageService = require('~services/image.service');
const categoryService = require('~services/category.service');
const { updateDocument } = require('~utils/tools');
const { customAlphabet } = require('nanoid');
const slugify = require('~utils/slugify');
const { mongodb } = require('~database');
const Product = mongodb.model('product');
const Image = mongodb.model('image');

function _projectDocument(product) {
  if (product.toJSON) {
    product = product.toJSON();
  }

  return _.omit(product, ['__v']);
}

async function _filterFindQueryInput(input) {
  const validation = await validate(input, {
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
  query = await _filterFindQueryInput(query);
  return Product.paginate(query, _projectDocument);
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

  const product = await Product.findById(input.id, input.fields);
  if (!product) {
    throw new NotFoundException({ 
      message: 'Product ID does not exist' 
    });
  }

  return _projectDocument(product);
}

async function _filterNewProductInput(input) {
  const validation = await validate(input, {
    'name': 'required|string|min:1|max:200',
    'title': 'string|max:1000',
    'categories': 'to:array|unique',
    'categories.*': 'mongo_id',
    'model': 'string|min:1|max:200',
    'brand': 'string|min:1|max:200',
    'description': 'string|max:4000',
    'warranty': 'string',
    'dateAvailable': 'date:YYYY/MM/DD',
    'active': 'boolean',
    'order': 'integer',

    'attributes': 'to:array',
    'attributes.*.name': 'required|string|min:1|max:200',
    'attributes.*.value': 'string|max:200',

    'pricingTemplate': 'required|string|uppercase|enum:PRODUCT,VARIANT',
    'price': 'required_if:pricingTemplate,PRODUCT|numeric|min:0',
    
    'special': 'not_allow_if:pricingTemplate,VARIANT|to:array',
    'special.*.customerGroup': 'mongo_id',
    'special.*.priority': 'integer',
    'special.*.salePrice': 'required|numeric|min:0',
    'special.*.effectiveDate': 'required|date:YYYY/MM/DD',
    'special.*.expiryDate': 'date:YYYY/MM/DD',
    
    'discount': 'not_allow_if:pricingTemplate,VARIANT|to:array',
    'discount.*.customerGroup': 'mongo_id',
    'discount.*.quantity': 'required|integer|min:1',
    'discount.*.priority': 'integer|min:0',
    'discount.*.value': 'required|numeric|min:0',
    'discount.*.effectiveDate': 'required|date:YYYY/MM/DD',
    'discount.*.expiryDate': 'date:YYYY/MM/DD',

    'variants': 'to:array',
    'variants.*.control': 'required|string|uppercase|enum:DROP_DOWN,COLOR_PICKER,MULTIPLE_CHOICE',
    'variants.*.name': 'required|string|min:1|max:200',
  
    'skus': 'required|to:array|min:1',
    'skus.*.code': 'string|min:1|max:200',
    'skus.*.images': 'required|to:array|min:1|max:5|unique',
    'skus.*.images.*': 'mongo_id',
    'skus.*.attributes': 'to:array',
    'skus.*.quantity': 'required|integer|min:0',
    'skus.*.order': 'integer',

    'skus.*.attributes.*.name': 'required|string|min:1|max:200',
    'skus.*.attributes.*.value': 'string|max:200',

    'skus.*.additionPrice': 'not_allow_if:pricingTemplate,VARIANT|object',
    'skus.*.additionPrice.sign': 'string|enum:-,+',
    'skus.*.additionPrice.value': 'numeric|min:0',
    'skus.*.price': 'not_allow_if:pricingTemplate,PRODUCT|numeric|min:0',
    
    'skus.*.special': 'not_allow_if:pricingTemplate,PRODUCT|to:array',
    'skus.*.special.*.customerGroup': 'mongo_id',
    'skus.*.special.*.priority': 'integer',
    'skus.*.special.*.salePrice': 'required|numeric|min:0',
    'skus.*.special.*.effectiveDate': 'required|date:YYYY/MM/DD',
    'skus.*.special.*.expiryDate': 'date:YYYY/MM/DD',

    'skus.*.discount': 'not_allow_if:pricingTemplate,PRODUCT|to:array',
    'skus.*.discount.*.customerGroup': 'mongo_id',
    'skus.*.discount.*.quantity': 'required|integer|min:1',
    'skus.*.discount.*.priority': 'integer|min:0',
    'skus.*.discount.*.value': 'required|numeric|min:0',
    'skus.*.discount.*.effectiveDate': 'requrired|date:YYYY/MM/DD',
    'skus.*.discount.*.expiryDate': 'date:YYYY/MM/DD',
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

function _generateProductSlug(product, input) {
  const shortid = customAlphabet('0123456789', 6);

  product.slug = `${slugify(input.name)}-${shortid()}`;
}

function _tracingCategoryPath(category, delimiter = ' > ') {
  return category.ancestors
    .map(ancestor => ancestor ? ancestor.name : '???')
    .concat(category.name)
    .join(delimiter);
}

async function _assignProductCategories(product, input) {
  const categories = await categoryService.findByIdsFromCache(input.categories);

  // Populate ancestors
  for (const [index, category] of categories.entries()) {
    if (!category) {
      throw new NotFoundException({ 
        message: `"categories.${index}" does not exist` 
      });
    }

    category.ancestors = await categoryService.findByIdsFromCache(category.ancestors);
  }

  product.categories = categories.map(category => {
    return { 
      _id: category.id, 
      path: _tracingCategoryPath(category) 
    };
  });
}

async function _createProductSkus(product, input, session) {
  product.skus = [];

  for (const [index, sku] of input.skus.entries()) {
    sku._id = ObjectId();

    const images = await Image.find({ "_id": { "$in": sku.images } });
    if (!images.length) {
      throw new NotFoundException({ 
        message: `skus.${index}.images IDs does not exist` 
      });
    } 
      
    await imageService.setMany(sku.images, `product:${product._id}/sku:${sku._id}/images`, session);
    sku.images = images;

    product.skus.push(sku);
  }
}

async function _prepareNewProduct(input, session) {
  const product = new Product(input);

  _generateProductSlug(product, input);

  await _assignProductCategories(product, input);

  await _createProductSkus(product, input, session);

  return product;
}

exports.create = async function (data) {
  const input = await _filterNewProductInput(data);

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const newProduct = await _prepareNewProduct(input, session);
    await newProduct.save({ session });

    return _projectDocument(newProduct);
  });
}

async function _filterUpdateProductInput(input) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'name': 'string|min:1|max:200',
    'title': 'string|max:1000',
    'categories': 'to:array|unique',
    'categories.*': 'mongo_id',
    'model': 'string|min:1|max:200',
    'brand': 'string|min:1|max:200',
    'description': 'string|max:4000',
    'warranty': 'string',
    'dateAvailable': 'date:YYYY/MM/DD',
    'active': 'boolean',
    'order': 'integer',

    'attributes': 'to:array',
    'attributes.*.name': 'required|string|min:1|max:200',
    'attributes.*.value': 'string|max:200',

    'pricingTemplate': 'string|uppercase|enum:PRODUCT,VARIANT',
    'price': 'numeric|min:0',
    
    'special': 'not_allow_if:pricingTemplate,VARIANT|to:array',
    'special.*.customerGroup': 'mongo_id',
    'special.*.priority': 'integer',
    'special.*.salePrice': 'required|numeric|min:0',
    'special.*.effectiveDate': 'required|date:YYYY/MM/DD',
    'special.*.expiryDate': 'date:YYYY/MM/DD',
    
    'discount': 'not_allow_if:pricingTemplate,VARIANT|to:array',
    'discount.*.customerGroup': 'mongo_id',
    'discount.*.quantity': 'required|integer|min:1',
    'discount.*.priority': 'integer|min:0',
    'discount.*.value': 'required|numeric|min:0',
    'discount.*.effectiveDate': 'required|date:YYYY/MM/DD',
    'discount.*.expiryDate': 'date:YYYY/MM/DD',

    'variants': 'to:array',
    'variants.*.control': 'required|string|uppercase|enum:DROP_DOWN,COLOR_PICKER,MULTIPLE_CHOICE',
    'variants.*.name': 'required|string|min:1|max:200',
  
    'skus': 'to:array|min:1',
    'skus.*.code': 'string|min:1|max:200',
    'skus.*.images': 'required|to:array|min:1|max:5|unique',
    'skus.*.images.*': 'mongo_id',
    'skus.*.attributes': 'to:array',
    'skus.*.quantity': 'required|integer|min:0',
    'skus.*.order': 'integer',

    'skus.*.attributes.*.name': 'required|string|min:1|max:200',
    'skus.*.attributes.*.value': 'string|max:200',

    'skus.*.additionPrice': 'not_allow_if:pricingTemplate,VARIANT|object',
    'skus.*.additionPrice.sign': 'string|enum:-,+',
    'skus.*.additionPrice.value': 'numeric|min:0',
    'skus.*.price': 'not_allow_if:pricingTemplate,PRODUCT|numeric|min:0',
    
    'skus.*.special': 'not_allow_if:pricingTemplate,PRODUCT|to:array',
    'skus.*.special.*.customerGroup': 'mongo_id',
    'skus.*.special.*.priority': 'integer',
    'skus.*.special.*.salePrice': 'required|numeric|min:0',
    'skus.*.special.*.effectiveDate': 'required|date:YYYY/MM/DD',
    'skus.*.special.*.expiryDate': 'date:YYYY/MM/DD',

    'skus.*.discount': 'not_allow_if:pricingTemplate,PRODUCT|to:array',
    'skus.*.discount.*.customerGroup': 'mongo_id',
    'skus.*.discount.*.quantity': 'required|integer|min:1',
    'skus.*.discount.*.priority': 'integer|min:0',
    'skus.*.discount.*.value': 'required|numeric|min:0',
    'skus.*.discount.*.effectiveDate': 'requrired|date:YYYY/MM/DD',
    'skus.*.discount.*.expiryDate': 'date:YYYY/MM/DD',
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

async function _deleteOldSkus(product, session) {
  for (const sku of product.skus) {
    const imageIds = sku.images.map(image => image._id);

    await imageService.unsetMany(imageIds, [`product:${product._id}/sku:${sku._id}/images`], session);
  }
}

async function _prepareUpdateProduct(product, input, session) {
  const clone = { ...input };

  if ('name' in input) {
    _generateProductSlug(product, clone);
  }

  if ('categories' in input) {
    await _assignProductCategories(product, clone);
    delete clone.categories;
  }

  if ('skus' in input) {
    await _deleteOldSkus(product, session);
    await _createProductSkus(product, input, session);
    delete clone.skus;
  }

  return updateDocument(product, clone);
}

exports.partialUpdate = async function (id, data) {
  const input = await _filterUpdateProductInput({ id, ...data });

  const product = await Product.findById(input.id);
  if (!product) {
    throw new NotFoundException({ 
      message: 'Product ID not found' 
    });
  }
  
  return await mongodb.transaction(async function (session, _commit, _abort) {
    const updated = await _prepareUpdateProduct(product, input, session);
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

exports.deleteById = async function (id) {
  const input = await _filterDeleteByIdInput({ id });

  const product = await Product.findByIdAndDelete(input.id).select('_id skus');
  if (!product) {
    throw new NotFoundException({ 
      message: 'Product ID does not exist'
    });
  }

  for (sku of product.skus) {
    const imageIds = sku.images.map(image => image._id);
    await imageService.unsetMany(imageIds, [`product:${product._id}/sku:${sku._id}/images`]);
  }

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

exports.deleteMany = async function (ids) {
  const input = await _filterDeleteManyInput({ ids });

  const products = await Product.find({ "_id": { "$in": ids } }, '_id skus');
  if (!products.length) {
    throw new NotFoundException({ 
      message: 'Product IDs does not exist' 
    });
  }

  const foundIds = products.map(i => i._id);
  const result = await Product.deleteMany({ "_id": { "$in": foundIds } }); 

  for (const product of products) {
    for (const sku of product.skus) {
      const imageIds = sku.images.map(image => image._id);
      await imageService.unsetMany(imageIds, [`product:${product._id}/sku:${sku._id}/images`]);
    }
  }

  return {
    expected: input.ids.length,
    found: foundIds,
    deletedCount: result.deletedCount
  };
}
