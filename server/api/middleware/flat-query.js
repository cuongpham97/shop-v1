const patterns = {
  '{key}={value},...': /(?<key>[^=]+)=(?<value>"(?:(?<=\\)"|[^"])+"|[^,]+)(?:,|$)/g,
  '{value},...'      : /(?<value>"(?:(?<=\\)"|[^"])+"|[^,]+)(?:,|$)/g
}

function _unflatten(str) {

  switch (true) {
    case patterns['{key}={value},...'].test(str): {

      let match, result = {};
      patterns['{key}={value},...'].lastIndex = 0;

      while(match = patterns['{key}={value},...'].exec(str)) {
        result[match.groups.key] = match.groups.value;
      }

      return result;
    }

    case patterns['{value},...'].test(str): {

      let match, result = [];
      patterns['{value},...'].lastIndex = 0;

      while(match = patterns['{value},...'].exec(str)) {
        result.push(match.groups.value);
      }

      return result.length == 1 ? result[0] : result
    }

    default: return str;
  }
}

exports.unflatten = function (req, _res, next) {

  Object.keys(req.query).forEach(param => req.query[param] = _unflatten(req.query[param]));

  return next();
}
