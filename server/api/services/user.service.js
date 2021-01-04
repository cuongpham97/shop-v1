const mongodb = require('../database/mongodb');

exports.find = async function(query) {
  return await mongodb.model('user').paginate(query);
}

exports.create = async function(user) {
  return await mongodb.model('user').create(user);
} 
