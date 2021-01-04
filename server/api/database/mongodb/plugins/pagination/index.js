const _ = require('lodash');

function validateOptions(options) {

  return options;
}

function buildQuery(options) {

  // Search
  let search = options.search ? [{ "$match": { "$text": { "$search": String(options.search) } } }] : [];

  // Regex 
  let fields = {};
  _.forEach(options.regexes, (value, key) => fields[key] = { "$regex": value, "$options": "im" });
  regexes = !_.isEmpty(fields) ? [{ "$match": fields }] : [];

  // Query 
  let query = options.filters ? [{ "$match": options.filters }] : [];

  // Skip
  let skip = [{ "$skip": (options.page - 1) * options.pageSize || 0 }];
  
  // Limit
  let limit = [{ "$limit": options.pageSize || 80 }];
  
  // Sort
  let sort = options.orders ? [{ "$sort": options.order }] : [];

  // Project
  let project = options.fields ? [{ "$project": options.fields }] : [];

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

  schema.statics.paginate = async function(options = {}) {

    let [docs] = await this.aggregate(buildQuery(options));
    
    return paginateResult.call(this, docs, options);
  }

}

module.exports = paginationPlugin;
