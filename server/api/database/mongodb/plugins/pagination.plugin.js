const _ = require('lodash');

function buildQuery(query, options) {

  // Search
  let search = options.search ? [{ "$match": { "$text": { "$search": options.search } } }] : [];

  // Regex 
  let fields = {};
  _.forEach(options.regexes, (value, key) => fields[key] = { "$regex": value, "$options": "im" });
  regexes = !_.isEmpty(fields) ? [{ "$match": fields }] : [];

  // Query 
  query = query ? [{ "$match": query }] : [];

  // Skip
  let skip = [{ "$skip": (options.page - 1) * options.pageSize || 0 }];
  
  // Limit
  let limit = [{ "$limit": options.pageSize || 80 }];
  
  // Sort
  let sort = options.orders ? [{ "$sort": options.order }] : [];

  // Project
  let project = options.fields ? [{ "$project": project }] : [];

  return [
    ... []
      .concat(search)
      .concat(regexes)
      .concat(query)
      .concat(sort)
      .concat(project),
    {
      "$facet": { 
        "data": [].concat(skip).concat(limit), 
        "total": [{"$count": "total"}] 
      }
    },
    {
      "$project": {
        "data": 1,
        "total": { 
          "$cond": { "if": { "$ne": ["$total", []] }, "then": { "$arrayElemAt": ["$total.total", 0] }, "else": 0 } 
        }
      }
    }
  ];
}

function paginateResult(docs, options) {
  let collection = options.collectionName || (this.collection.name + 's');

  return {
    data: docs.data,
    metadata: {
      collection: collection,
      page: options.page || 1,
      pageSize: options.pageSize || 80,
      maxPage: Math.ceil(docs.total / options.pageSize),
      count: docs.data.length,
      total: docs.total,   
      isPre: docs.total > (options.page - 2) * options.pageSize,
      isNext: docs.total > options.page * options.pageSize
    }
  };
}

function paginationPlugin(schema, options) {

  schema.statics.paginate = async function(query, options = {}, callback) {

    let [docs] = await this.aggregate(buildQuery.call(this, query, options));

    let result = paginateResult.call(this, docs, options);

    return (callback) ? callback(result) : result;
  }

}

module.exports = paginationPlugin;
