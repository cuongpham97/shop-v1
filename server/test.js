 const mongodb = require('./api/database/mongodb');



const _ = require('lodash');
const query = require('./api/middleware/querystring')

let req = {
  query: { regexes: "displayName=Ph" }
};

query.unflattenQueryString(req, null, function(){});

(async function() {
  console.log(await mongodb.model('user').paginate({ "local.phone": "0326503636" }, {
    regexes: req.query.regexes,
    page: 1,
    pageSize: 5
  }));
})()