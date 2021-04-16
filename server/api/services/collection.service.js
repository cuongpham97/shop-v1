const validate = require('~utils/validate');
const pricing = require('~libraries/pricing');
const { mongodb } = require('~database');
const Product = mongodb.model('product');
const moment = require('moment');

function _projectDocument(product) {
  if (product.toJSON) {
    product = product.toJSON();
  }

  return _.omit(product, ['__v']);
}

function _pricingProduct(product) {
  product.skus = product.skus.map(sku => {
    sku.pricing = pricing.previewProduct(product, sku);

    return sku;
  });

  return product;
}

async function _filterQuery(query) {
  const validation = await validate(query, {
    'search': 'string|max:200',
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

async function _findProducts(query) {
  const now = moment().toDate();

  query.filters = _.merge(query.filters, {
    "active": true,
    "dateAvailable": { "$lte": now }
  });

  query.fields = (query.fields || []).concat(['-description']);

  return await Product.paginate(query, product => {
    return _projectDocument(_pricingProduct(product));
  });
}

exports.findAllProducts = async function (query) {
  query = await _filterQuery(query);

  return await _findProducts(query);
}

async function _buildFindNewestQuery(query) {
  query = await _filterQuery(query);

  query.orders = ['-_id'];

  return query;
}

exports.findNewestProducts = async function (query) {
  query = await _buildFindNewestQuery(query);

  return await _findProducts(query);
}
