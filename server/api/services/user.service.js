const mongodb = require('../database/mongodb');

exports.createUser = async function(user) {
  return await mongodb.model('user').create(user);
} 
