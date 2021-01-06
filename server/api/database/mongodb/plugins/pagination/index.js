const validate = require('../../../../../utilities/validator');
const _ = require('lodash');

async function validateOptions(options) {

  let { result, errors } = await validate(options, {
    'search'    : 'string|trim|max:200',
    'regexes'   : 'object',
    'filters'   : 'object',
    'orders'    : 'to:array',
    'orders.*'  : 'string|min:1|max:100',
    'fields'    : 'to:array',
    'fields.*'  : 'string|min:1|max:100',
    'page'      : 'integer|min:1',
    'pageSize'  : 'integer|min:1|max:200'
  });

  if (errors) throw new Error(errors);

  return result;
}

const makeQuery = {
  search: function(text) {
    return text ? [{ "$match": { "$text": { "$search": text } } }] : [];
  },

  regexes: function(regexes) {
    let fields = {};

    _.forEach(regexes, (value, key) => fields[key] = { "$regex": value, "$options": "im" });

    return !_.isEmpty(fields) ? [{ "$match": fields }] : [];
  },

  query: function(filters) {
    return filters ? [{ "$match": filters }] : [];
  },

  skip: function(page, pageSize) {
    return [{ "$skip": (page - 1) * pageSize || 0 }];
  },

  limit: function(pageSize) {
    return [{ "$limit": pageSize || 80 }];
  },

  sort: function(fields) {
    if (!fields) return [];

    let orders = {};

    fields.forEach(field => field.startsWith('-') ? orders[field.substring(1)] = -1 : orders[field] = 1);

    return [{ "$sort": orders }];
  },

  project: function(fields) {
    if (!fields) return [];

    const valid = fields.every(field => !field.startsWith('-')) || fields.every(field => field.startsWith('-'));

    if (!valid) return [];

    let project = {};

    fields.forEach(field => field.startsWith('-') ? project[field.substring(1)] = 0 : project[field] = 1);

    return [{ "$project": project }];
  }
}

function buildQuery(options) {
  
  const search = makeQuery.search(options.search);
  const regexes = makeQuery.regexes(options.regexes); 
  const query = makeQuery.query(options.filters);
  const skip = makeQuery.skip(options.page, options.pageSize);
  const limit = makeQuery.limit(options.pageSize);
  const sort = makeQuery.sort(options.orders);
  const project = makeQuery.project(options.fields);

  return [
    ... []
      .concat(search)
      .concat(regexes)
      .concat(query)
      .concat(sort),
    {
      "$facet": { 
        "data": [].concat(skip).concat(limit).concat(project), 
        "total": [{"$count": "total"}] 
      }
    },
    {
      "$project": {
        "data": 1,
        "total": { 
          "$cond": { 
            "if": { "$ne": ["$total", []] }, 
            "then": { "$arrayElemAt": ["$total.total", 0] }, 
            "else": 0 
          }
        }
      }
    }
  ];
}

function paginateResult(docs, options) {
  let collection = options.collectionName || (this.collection.name + 's');

  let page = options.page || 1;
  let pageSize = options.pageSize || 80;

  return {
    data: docs.data,
    metadata: {
      collection: collection,
      page: page,
      pageSize: pageSize,
      maxPage: Math.ceil(docs.total / pageSize),
      count: docs.data.length,
      total: docs.total,   
      isPre: page > 1 && docs.total > (page - 2) * pageSize,
      isNext: docs.total > page * pageSize
    }
  };
}

function paginationPlugin(schema, options) {

  schema.statics.paginate = async function(options = {}, validateOpts = false) {

    options = validateOpts ? await validateOptions(options) : options;

    let [docs] = await this.aggregate(buildQuery(options));
    
    return paginateResult.call(this, docs, options);
  }

}

module.exports = paginationPlugin;
