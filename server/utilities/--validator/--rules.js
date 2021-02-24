const Validator = require('validatorjs');
const moment = require('moment');

function isAcceptable(value) {
  
  if (value === null || value === undefined || value === '') {
    return false;
  }

  if (typeof value === 'object' && _.isEmpty(value)) {
    return false;
  }

  return true;
}

Validator.registerImplicit('required', value => isAcceptable(value));

Validator.registerAsyncImplicit('present', function (field, _value, _args, done) {

  return _.has(this.input, field)
    ? done()
    : done(false); 
})

Validator.registerAsyncImplicit('required_if', function (_field, value, args, done) {
  
  const [orField, orValue] = args.split(',');

  if (_.get(this.input, orField) == orValue && !isAcceptable(value)) {
    return done(false, null, { or: orField, value: orValue });   
  }
  
  return done();
});

Validator.registerAsyncImplicit('required_with', function (_field, value, args, done) {
  
  const present = args.split(',').filter(key => _.has(this.input, key)).length;

  return (present && !isAcceptable(value))
    ? done(false, null, { is: args })
    : done();
});

Validator.registerAsyncImplicit('required_without', function (field, _value, args, done) {

  if (_.has(this.input, field)) return done(); 

  const without = args.split(',').find(i => !_.has(this.input, i));

  return without 
    ? done(false, null, { is: without })
    : done();
});

Validator.registerAsyncImplicit('required_one_of', function (_field, _value, args, done) {

  let count = args.split(',').filter(key => isAcceptable(_.get(this.input, key))).length;

  return count === 1 
    ? done()
    : done(false, null, { field: args.replace(',', ', ') });
});

Validator.registerAsyncImplicit('not_allow', function(field, _value, _args, done) {

  if (!_.has(this.input, field)) return done();

  return done(false);
});

Validator.registerAsyncImplicit('not_allow_if', function(field, _value, args, done) {
  
  if (!_.has(this.input, field)) return done();

  const [orField, orValue] = args.split(',');

  return _.get(this.input, orField) == orValue && _.has(this.input, field)
    ? done(false, null, { or: orField, value: orValue })
    : done();
});

Validator.registerAsyncImplicit('unset', function(field, _value, _args, done) {

  if (_.has(input, field)) {
    _.unset(input, field);
  }

  return done();
});

Validator.registerAsyncWithNullable('object', function(field, value, _args, done) {

  switch (true) {
    case !_.has(this.input, field):

    case value === null && this.ruleName.endsWith('+null'):

    case value !== null && typeof value === 'object':
      return done();
    
    default: 
      return done(false);
  }
});

Validator.registerAsyncWithNullable('boolean', function(field, value, _args, done) {

  if (!_.has(this.input, field)) return done();

  return typeof value === 'boolean'
    ? done()
    : done(false);
});

Validator.registerAsyncWithNullable('numeric', function (field, value, _args, done) {

  if (!_.has(this.input, field)) return done();

  const num = Number(value);

  const check = typeof num === "number" && !isNaN(num) && typeof val !== "boolean";
 
  if (!check) return done(false);

  _.set(this.input, field, num);

  return done();
});

Validator.registerAsyncWithNullable('integer', function(field, value, _args, done) {
  
  if (!_.has(this.input, field)) return done();

  const isInteger = /^\d+$/.test(value);

  if (!isInteger) return done(false);

  _.set(this.input, field, parseInt(value));

  return done();
});

Validator.registerAsyncWithNullable('array', function(field, value, _args, done) {

  if (!_.has(this.input, field)) return done();

  return done(Array.isArray(value));
});

Validator.registerAsyncWithNullable('to', function(field, value, args, done) {

  if (!_.has(this.input, field)) return done();

  args = args.split(',');
  let type = args[0];

  switch (type) {
    case 'array': 
      _.set(this.input, field, [].concat(value));
      return done();
    
    case 'date':
      const format = args[1] || '';
      _.set(this.input, field, moment(value, format).toDate());
      return done();

    default: return done(false);
  }
});

Validator.registerAsyncImplicit('unique', function (field, value, _args, done) {

  if (!_.has(this.input, field)) return done();

  if (!Array.isArray(value)) return done(false);

  _.set(this.input, field, [...new Set(value)]);

  return done();
});

Validator.registerAsyncWithNullable('mongo_id', function(field, value, _args, done) {

  if (!_.has(this.input, field)) return done();

  const isId = /^[0-9a-fA-F]{24}$/.test(value);

  if (!isId) return done(false);

  _.set(this.input, field, ObjectId(value));

  return done();
});

Validator.registerAsyncWithNullable('enum', function (field, value, args, done) {

  if (!_.has(this.input, field)) return done();

  return args.split(',').includes(value)
    ? done()
    : done(false, null, { enum: args });
});

Validator.registerAsyncWithNullable('date', function(field, value, args, done) {

  if (!_.has(this.input, field)) return done();

  const format = args || 'YYYY/MM/DD';

  return moment(value, format, true).isValid()
    ? done()
    : done(false, null, { format: format });
});

Validator.registerAsyncWithNullable('regex', function(field, value, args, done) {

  if (!_.has(this.input, field)) return done();

  const rg = /^\/(?<regex>.+)\/(?<options>[img]*)$/;

  if (!rg.test(args)) {
    return done(new RegExp(args).test(value))
  }

  const match = rg.exec(args);

  return done(new RegExp(match.groups.regex, match.groups.options).test(value));
});

Validator.registerAsyncWithNullable('phone', function(field, value, _args, done) {

  if (!_.has(this.input, field)) return done();

  return /^[+0-9]{8,12}$/.test(value) 
    ? done()
    : done(false);
});

Validator.registerAsyncWithNullable('email', function (field, value, _args, done) {

  if (!_.has(this.input, field)) return done(); 

  let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  if (!regex.test(value)) {
    // added support domain 3-n level https://github.com/skaterdav85/validatorjs/issues/384
    regex = /^((?:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]|[^\u0000-\u007F])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)+)*$/;
  }

  return regex.test(value) 
    ? done()
    : done(false);
});

Validator.registerAsync('primative', function(field, value, _args, done) {

  switch (value) {
    case 'true': 
      _.set(this.input, field, true);
      return done();

    case 'false': 
      _.set(this.input, field, false);
      return done();
    
    case 'null':
      _.set(this.input, field, null);
      return done();
    
    case 'undefined':
      _.set(this.input, field, undefined);
      return done();
    
    default:
      _.set(this.input, field, /^\d+$/.test(value) ? Number(value) : value);
      return done();
  }
});

const deepMap = function map(o, fn, traceArray = false, traceEnum = false) {

  const keys = Object[traceEnum ? 'getOwnPropertyNames' : 'keys' ](o);

  for (const key of keys) {
    
    const action = fn({ key: key, value: o[key] });

    if (!action) continue;

    const newKey = action.key;
    const value = action.value;

    // Delete key
    if (!newKey) {
      delete o[key];
      continue;
    }

    o[newKey] = value;
 
    // Rename key
    if (newKey !== key) {
      delete o[key];
    }

    if (typeof o[newKey] === 'object' && o[newKey] !== null) {

      if (traceArray || !Array.isArray(o[newKey])) {
        map(o[newKey], fn, traceArray, traceEnum);
      } 
    }
  }
}

Validator.registerAsync('mongo_guard', function(field, value, _args, done) {

  switch (true) {
    // Is a string
    case typeof value === 'string' || value instanceof String:
      _.set(this.input, field, value.replace(/^\$/, '\\$'));
      return done();
    
    // Is a object
    case typeof value === 'object' && value !== null:
      deepMap(value, item => {
        return  {
          key  : `${item.key}`.replace(/^\$/, '\\$'),
          value: `${item.value}`.replace(/^\$/, '\\$')  
        }
      }, true);
  
      return done();
    
    // Other
    default: return done();
  }
});

Validator.registerAsync('min', function(_field, value, args, done) {
  
  const min = parseInt(args);

  if (typeof value === 'number') {
    return value >= min
      ? done()
      : done(false, null, { min: min });
  }

  return value.length >= min
    ? done()
    : done(false, null, { min: min });
});

Validator.registerAsync('max', function(_field, value, args, done) {

  const max = parseInt(args);

  if (typeof value === 'number') {
    return max >= value 
      ? done()
      : done(false, null, { max: max });
  }

  return max > value.length
    ? done()
    : done(false, null, { max: max });
});

Validator.registerAsync('uppercase', function(field, value, _args, done) {

  if (!value.toUpperCase) return done(false);

  _.set(this.input, field, value.toUpperCase());

  return done();
});

Validator.registerAsync('lowercase', function(field, value, _args, done) {

  if (!value.toLowerCase) return done(false);

  _.set(this.input, field, value.toLowerCase());

  return done();
});

Validator.registerAsync('trim', function(field, value, _args, done) {

  if (!value.trim) return done(false);

  _.set(this.input, field, value.trim());

  return done();
});

Validator.registerAsync('titlecase', function(field, value, _args, done) {

  if (!value.toUpperCase) return done(false);

  _.set(this.input, field, _.startCase(value));

  return done();
});

Validator.registerAsync('any', function (_field, _value, _args, done) {
  return done();
});
