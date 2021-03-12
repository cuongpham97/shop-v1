const validate = require('~utils/validate');

function _makeSearchQuery(text) {
  return text ? { "$match": { "$text": { "$search": text } } } : [];
}

function _makeRegexQuery(regexes) {
  let fields = {};

  _.forEach(regexes, (value, key) => fields[key] = { "$regex": value, "$options": "im" });

  return !_.isEmpty(fields) ? { "$match": fields } : [];
}

function _makeMatchQuery(filters) {
  return filters ? { "$match": filters } : [];
}

function _makeSkipQuery(page, pageSize) {
  return { "$skip": (page - 1) * pageSize || 0 };
}

function _makeLimitQuery(pageSize) {
  return { "$limit": pageSize || 80 };
}

function _makeSortQuery(fields) {
  if (!fields) return [];

  let orders = {};

  fields.forEach(field => field.startsWith('-') ? orders[field.substring(1)] = -1 : orders[field] = 1);

  return { "$sort": orders };
}

function _makeProjectQuery(fields) {
  if (!fields) return [];

  const valid = fields.every(field => !field.startsWith('-')) || fields.every(field => field.startsWith('-'));

  if (!valid) return [];

  let project = {};

  fields.forEach(field => field.startsWith('-') ? project[field.substring(1)] = 0 : project[field] = 1);

  return { "$project": project };
}

function _buildQuery(options) {
  
  const search = _makeSearchQuery(options.search);
  const regexes = _makeRegexQuery(options.regexes); 
  const query = _makeMatchQuery(options.filters);
  const skip = _makeSkipQuery(options.page, options.pageSize);
  const limit = _makeLimitQuery(options.pageSize);
  const sort = _makeSortQuery(options.orders);
  const project = _makeProjectQuery(options.fields);

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

function _paginateResult(docs, options, transform) {
  const collection = options.collectionName || (this.collection.name);

  const page = options.page;
  const pageSize = options.pageSize;
  
  let data = docs.data;
  if (transform) {
    data = data.map(transform);
  }

  return {
    data: data,
    metadata: {
      collection: collection,
      page: page,
      pageSize: pageSize,
      maxPage: Math.ceil(docs.total / pageSize),
      count: data.length,
      total: docs.total,   
      isPre: page > 1 && docs.total > (page - 2) * pageSize,
      isNext: docs.total > page * pageSize
    }
  };
}

function paginationPlugin(schema, _options) {

  schema.statics.paginate = async function(options, transform) {

    const paging = {
      page: 1,
      pageSize: 80
    };

    options = _.assign(paging, options);
    const query = _buildQuery(options);
    const [docs] = await this.aggregate(query);
    
    return _paginateResult.call(this, docs, options, transform);
  }
}

module.exports = paginationPlugin;
