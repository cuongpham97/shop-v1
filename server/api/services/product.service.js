const validate = require('~utils/validator');
const imageService = require('~services/image.service');
const categoryService = require('~services/category.service');
const { updateDocument } = require('~utils/tools');
const { customAlphabet } = require('nanoid');
const { mongodb } = require('~database');
const slugify = require('~utils/slugify');

exports.model = mongodb.model('product');

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

  return await mongodb.model('product').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;

  const product = await mongodb.model('product').findById(id, fields);

  if (!product) {
    throw new NotFoundException({ message: 'Product ID not found' });
  }

  return product;
}

exports.create = async function (product) {

  const validation = await validate(product, {
    "name": "required|string|min:1|max:200",
    "title": "string|max:1000",
    "categories": "to:array|unique",
    "categories.*": "mongo_id",
    "model": "string|min:1|max:200",
    "brand": "string|min:1|max:200",
    "description": "string|max:4000",
    "warranty": "string",
    "dateAvailable": "date:YYYY/MM/DD",
    "active": "boolean",
    "order": "integer",

    "attributes": "to:array",
    "attributes.*.name": "required|string|min:1|max:200",
    "attributes.*.value": "string|max:200",

    "pricingTemplate": "required|string|uppercase|enum:PRODUCT,VARIANT",
    "price": "required_if:pricingTemplate,PRODUCT|numeric|min:0",
    
    "special": "not_allow_if:pricingTemplate,VARIANT|to:array",
    "special.*.customerGroup": "mongo_id",
    "special.*.priority": "integer",
    "special.*.salePrice": "required|numeric|min:0",
    "special.*.effectiveDate": "required|date:YYYY/MM/DD",
    "special.*.expiryDate": "date:YYYY/MM/DD",
    
    "discount": "not_allow_if:pricingTemplate,VARIANT|to:array",
    "discount.*.customerGroup": "mongo_id",
    "discount.*.quantity": "required|integer|min:1",
    "discount.*.priority": "integer|min:0",
    "discount.*.price": "required|numeric|min:0",
    "discount.*.effectiveDate": "required|date:YYYY/MM/DD",
    "discount.*.expiryDate": "date:YYYY/MM/DD",

    "variants": "to:array",
    "variants.*.control": "required|string|uppercase|enum:DROP_DOWN,COLOR_PICKER,MULTIPLE_CHOICE",
    "variants.*.name": "required|string|min:1|max:200",
  
    "skus": "required|to:array|min:1",
    "skus.*.code": "string|min:1|max:200",
    "skus.*.images": "required|to:array|min:1|max:5|unique",
    "skus.*.images.*": "mongo_id",
    "skus.*.attributes": "to:array",
    "skus.*.quantity": "required|integer|min:0",
    "skus.*.order": "integer",

    "skus.*.attributes.*.name": "required|string|min:1|max:200",
    "skus.*.attributes.*.value": "string|max:200",

    "skus.*.additionPrice": "not_allow_if:pricingTemplate,VARIANT|object",
    "skus.*.additionPrice.sign": "string|enum:-,+",
    "skus.*.additionPrice.value": "numeric|min:0",
    "skus.*.price": "not_allow_if:pricingTemplate,PRODUCT|numeric|min:0",
    
    "skus.*.special": "not_allow_if:pricingTemplate,PRODUCT|to:array",
    "skus.*.special.*.customerGroup": "mongo_id",
    "skus.*.special.*.priority": "integer",
    "skus.*.special.*.salePrice": "required|numeric|min:0",
    "skus.*.special.*.effectiveDate": "required|date:YYYY/MM/DD",
    "skus.*.special.*.expiryDate": "date:YYYY/MM/DD",

    "skus.*.discount": "not_allow_if:pricingTemplate,PRODUCT|to:array",
    "skus.*.discount.*.customerGroup": "mongo_id",
    "skus.*.discount.*.quantity": "required|integer|min:1",
    "skus.*.discount.*.priority": "integer|min:0",
    "skus.*.discount.*.price": "required|numeric|min:0",
    "skus.*.discount.*.effectiveDate": "requrired|date:YYYY/MM/DD",
    "skus.*.discount.*.expiryDate": "date:YYYY/MM/DD",
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  product = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {

    //#region Generate _id

    product._id = ObjectId();
    
    //#endregion Generate _id

    //#region Generate slug

    const shortid = customAlphabet('0123456789', 6);
    product.slug = `${slugify(product.name)}-${shortid()}`;

    //#endregion Generate slug

    //#region Transform categories

    // Get categories
    let categories = await categoryService.cache.getByIds(product.categories);

    // Populate ancestors
    for (const [index, category] of categories.entries()) {

      if (!category) {
        throw new NotFoundException({ message: `"categories.${index}" does not exist` });
      }

      category.ancestors = await categoryService.cache.getByIds(category.ancestors);
    }
  
    product.categories = categories.map(category => {

      // Tracing category path
      const path = category.ancestors
        .map(ancestor => ancestor ? ancestor.name : '???')
        .concat(category.name)
        .join(' > ');

      return { _id: category.id, path: path };
    });
    
    //#endregion Transform categories

    //#region Create skus

    for (const [index, sku] of product.skus.entries()) {

      // Generate sku _id
      sku._id = ObjectId();

      sku.images = await mongodb.model('image').find({ "_id": { "$in": sku.images } });

      if (!sku.images.length) {
        throw new NotFoundException({ message: `skus.${index}.images IDs does not exist` });
      }

      let imageIds = sku.images.map(image => image._id);

      await imageService.setMany(imageIds, `product:${product._id}/sku:${sku._id}/images`, session);
    }
  
    //#endregion Create skus

    const newProduct = await mongodb.model('product').create(product);

    return newProduct;
  });
}

exports.partialUpdate = async function (id, data) {

  data.id = id;

  const validation = await validate(data, {
    'id': 'mongo_id',

    "name": "string|min:1|max:200",
    "title": "string|max:1000",
    "categories": "to:array|unique",
    "categories.*": "mongo_id",
    "model": "string|min:1|max:200",
    "brand": "string|min:1|max:200",
    "description": "string|max:4000",
    "warranty": "string",
    "dateAvailable": "date:YYYY/MM/DD",
    "active": "boolean",
    "order": "integer",

    "attributes": "to:array",
    "attributes.*.name": "required|string|min:1|max:200",
    "attributes.*.value": "string|max:200",

    "pricingTemplate": "string|uppercase|enum:PRODUCT,VARIANT",
    "price": "numeric|min:0",
    
    "special": "not_allow_if:pricingTemplate,VARIANT|to:array",
    "special.*.customerGroup": "mongo_id",
    "special.*.priority": "integer",
    "special.*.salePrice": "required|numeric|min:0",
    "special.*.effectiveDate": "required|date:YYYY/MM/DD",
    "special.*.expiryDate": "date:YYYY/MM/DD",
    
    "discount": "not_allow_if:pricingTemplate,VARIANT|to:array",
    "discount.*.customerGroup": "mongo_id",
    "discount.*.quantity": "required|integer|min:1",
    "discount.*.priority": "integer|min:0",
    "discount.*.price": "required|numeric|min:0",
    "discount.*.effectiveDate": "required|date:YYYY/MM/DD",
    "discount.*.expiryDate": "date:YYYY/MM/DD",

    "variants": "to:array",
    "variants.*.control": "required|string|uppercase|enum:DROP_DOWN,COLOR_PICKER,MULTIPLE_CHOICE",
    "variants.*.name": "required|string|min:1|max:200",
  
    "skus": "to:array|min:1",
    "skus.*.code": "string|min:1|max:200",
    "skus.*.images": "required|to:array|min:1|max:5|unique",
    "skus.*.images.*": "mongo_id",
    "skus.*.attributes": "to:array",
    "skus.*.quantity": "required|integer|min:0",
    "skus.*.order": "integer",

    "skus.*.attributes.*.name": "required|string|min:1|max:200",
    "skus.*.attributes.*.value": "string|max:200",

    "skus.*.additionPrice": "not_allow_if:pricingTemplate,VARIANT|object",
    "skus.*.additionPrice.sign": "string|enum:-,+",
    "skus.*.additionPrice.value": "numeric|min:0",
    "skus.*.price": "not_allow_if:pricingTemplate,PRODUCT|numeric|min:0",
    
    "skus.*.special": "not_allow_if:pricingTemplate,PRODUCT|to:array",
    "skus.*.special.*.customerGroup": "mongo_id",
    "skus.*.special.*.priority": "integer",
    "skus.*.special.*.salePrice": "required|numeric|min:0",
    "skus.*.special.*.effectiveDate": "required|date:YYYY/MM/DD",
    "skus.*.special.*.expiryDate": "date:YYYY/MM/DD",

    "skus.*.discount": "not_allow_if:pricingTemplate,PRODUCT|to:array",
    "skus.*.discount.*.customerGroup": "mongo_id",
    "skus.*.discount.*.quantity": "required|integer|min:1",
    "skus.*.discount.*.priority": "integer|min:0",
    "skus.*.discount.*.price": "required|numeric|min:0",
    "skus.*.discount.*.effectiveDate": "requrired|date:YYYY/MM/DD",
    "skus.*.discount.*.expiryDate": "date:YYYY/MM/DD",
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors });
  }

  id = validation.result.id;
  _.unset(validation.result, 'id');

  data = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {

    let product = await mongodb.model('product').findById(id);

    if (!product) {
      throw new NotFoundException({ message: 'Product ID not found' });
    }
    
    //#region Regenerate slug

    if (data.name) {
      const shortid = customAlphabet('0123456789', 6);
      data.slug = `${slugify(data.name)}-${shortid()}`;
    }

    //#endregion Regenerate slug

    //#region Transform categories

    if (data.categories) {

      // Get categories
      let categories = await categoryService.cache.getByIds(data.categories);

      // Populate ancestors
      for (const [index, category] of categories.entries()) {

        if (!category) {
          throw new NotFoundException({ message: `"categories.${index}" does not exist` });
        }

        category.ancestors = await categoryService.cache.getByIds(category.ancestors);
      }
    
      data.categories = categories.map(category => {

        // Tracing category path
        const path = category.ancestors
          .map(ancestor => ancestor ? ancestor.name : '???')
          .concat(category.name)
          .join(' > ');

        return { _id: category.id, path: path };
      });

    }
   
    //#endregion Transform categories

    //#region Create skus

    if (data.skus) {

      //Remove image from old skus
      for (const sku of product.skus) {

        const imageIds = sku.images.map(image => image._id);

        await imageService.unsetMany(imageIds, [`product:${product._id}/sku:${sku._id}/images`], session);
      }

      // Create new skus
      for (const [index, sku] of data.skus.entries()) {

        // Generate sku _id
        sku._id = ObjectId();
  
        sku.images = await mongodb.model('image').find({ "_id": { "$in": sku.images } });
  
        if (!sku.images.length) {
          throw new NotFoundException({ message: `skus.${index}.images IDs does not exist` });
        }
  
        let imageIds = sku.images.map(image => image._id);
  
        await imageService.setMany(imageIds, `product:${product._id}/sku:${sku._id}/images`, session);
      }
    }

    //#endregion Create skus

    await updateDocument(product, data).save({ session });

    return product;
  });
}
