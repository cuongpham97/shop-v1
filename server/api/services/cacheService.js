let cache = {};

exports.set = function (key, value) {
  cache[key] = value;
}

exports.get = function (key) {
  return cache[key];
}

exports.has = function (key) {
  return _.has(cache, key);
}

exports.unset = function (key) {
  _.unset(cache, key);
}

exports.clear = function () {
  cache = {};
}
