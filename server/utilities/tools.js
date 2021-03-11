const Router = require('express-promise-router');
const mongoose = require('mongoose');

function _flatten(o, skipTrace = []) {
  const result = {};

  function _recursive(o, path) {
    for (const [key, value] of Object.entries(o)) {
      
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'object' && value !== null && !skipTrace.some(fn => fn(value))) {
        _recursive(value, currentPath); 
      }
      else {
        result[currentPath] = value;
      }
    }
  }

  _recursive(o, null);

  return result;
}

exports.updateDocument = function _updateMongooseDocument(document, data) {
  
  const skip = [Array.isArray, v => v instanceof ObjectId || v instanceof mongoose.Model];

  for (const [key, value] of Object.entries(_flatten(data, skip))) {
    document.set(key, value);
  }

  return document;
}

exports.createRouter = function _createAsyncRouter() {
  return Router();
}
