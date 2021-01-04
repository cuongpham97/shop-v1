function sanitize(str) {
  if (!typeof str === 'string' && !str instanceof String) {
    throw new Error('Cannot convert ' + typeof str + 'to string');
  }

  return str.replace('$', '_');
}

function parseKey(str) {
  switch (true) {
    case str.startsWith("'") && str.endsWith("'"): return str.slice(1, -1);
    case str.startsWith('"') && str.endsWith('"'): return str.slice(1, -1);
    default: return str;
  }
}

function parseValue(str) {
  switch (true) {
    case str == 'true'      : return true;
    case str == 'false'     : return false;
    case str == 'null'      : return null;
    case str == 'undefined' : return undefined;
    case !isNaN(str)        : return Number(str);
    case str.startsWith("'") && str.endsWith("'"): return str.slice(1, -1);
    case str.startsWith('"') && str.endsWith('"'): return str.slice(1, -1);
    default                 : return str;
  }
}

const patterns = {
  '{key}={value},...': /(?<key>[^=]+)=(?<value>"(?:(?<=\\)"|[^"])+"|[^,]+)(?:,|$)/g,
  '{value},...'      : /(?<value>"(?:(?<=\\)"|[^"])+"|[^,]+)(?:,|$)/g
}

/**
 * ex: flatten('name,age,address') => [name, age, address]
 * ex: flatten('name=a,age=20,address=street') => { name: 'a', age: 20, address: 'street' } 
 */

function flatten(str) {

  switch (true) {
    case patterns['{key}={value},...'].test(str): {

      let match, result = {};
      patterns['{key}={value},...'].lastIndex = 0;

      while(match = patterns['{key}={value},...'].exec(str)) {
        result[parseKey(match.groups.key)] = parseValue(match.groups.value);
      }

      return result;
    }

    case patterns['{value},...'].test(str): {

      let match, result = [];
      patterns['{value},...'].lastIndex = 0;

      while(match = patterns['{value},...'].exec(str)) {
        result.push(parseValue(match.groups.value));
      }

      return result.length == 1 ? parseValue(result[0]) : result
    }

    default: return parseValue(str);
  }
}

exports.unflatten = function (req, res, next) {
  let query = req.query;
  Object.keys(query).forEach(key => query[key] = flatten(sanitize(query[key])));
  
  return next();
}
