
exports.deepMap = function (object, enumerate, callback) {

  let keys = enumerate ? Object.getOwnPropertyNames(object) : Object.keys(object);

  for (let key of keys) {
  
    if (typeof object[key] === 'object') {
      deepMap(object[key], enumerate, callback);

    } else {
      object[key] = callback(object[key]);
    }

  }
}
