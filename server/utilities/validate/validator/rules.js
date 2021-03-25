const moment = require('moment');

function _isAcceptable(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  if (typeof value === 'object' && _.isEmpty(value)) {
    return false;
  }

  return true;
}

function present(_attribute, _value, _args, done) {
  return done(this.isPresent());
}

function required(_attribute, value, _args, done) {
  return done(_isAcceptable(value));
}

function required_if(_attribute, value, args, done) {
  const [orField, orValue] = Array.isArray(args) ? args : args.split(',');

  return this.getInputAttribute(orField) !== orValue || _isAcceptable(value)
    ? done()
    : done(false, null, { or: orField, value: orValue });   
}

function required_with(_attribute, value, args, done) {
  const present = args.split(',').filter(key => this.hasInputAttribute(key)).length;

  return (!present || _isAcceptable(value))
    ? done()
    : done(false, null, { is: args });
}

function required_without(_attribute, value, args, done) {
  if (this._isAcceptable(value)) return done(); 

  const without = args.split(',').find(i => !this.hasInputAttribute(i));

  return without 
    ? done(false, null, { is: without })
    : done();
}

function required_one_of(_attribute, _value, args, done) {
  const count = args.split(',').filter(key => _isAcceptable(this.getInputAttribute(key))).length;

  return count === 1 
    ? done()
    : done(false, null, { field: args.replace(',', ', ') });
}

function not_allow(_attribute, _value, _args, done) {
  return this.isPresent() 
    ? done(false) 
    : done();
}

function not_allow_if(_attribute, _value, args, done) {
  if (!this.isPresent()) return done();

  const [orField, orValue] = Array.isArray(args) ? args : args.split(',');

  return this.getInputAttribute(orField) == orValue
    ? done(false, null, { or: orField, value: orValue })
    : done();
}

function unset(attribute, _value, _args, done) {
  if (this.isPresent()) {
    _.unset(this.input, attribute);
  }

  return done();
}

function nullable(_attribute, _value, _args, done) {
  done(true);
}

function object(_attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  return done(typeof value === 'object' && value !== null);
}

function boolean(_attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  return typeof value === 'boolean'
    ? done()
    : done(false);
}

function numeric(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  const num = Number(value);
  const check = typeof num === 'number' && !isNaN(num) && typeof value !== 'boolean' && value !== '';
  if (!check) return done(false);

  this.setInputAttribute(attribute, num);
  return done();
}

function integer(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  const isInteger = /^-*\d+$/.test(value);
  if (!isInteger) return done(false);

  this.setInputAttribute(attribute, parseInt(value));
  return done();
}

function string(_attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  return done(typeof value === 'string');
}

function array(_attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  return done(Array.isArray(value));
}

function unique(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  if (!Array.isArray(value)) return done(false);

  this.setInputAttribute(attribute, [...new Set(value)]);
  return done();
}

function to(attribute, value, args, done) {
  if (this.notPresentOrAcceptNullable()) return done();
  
  args = args.split(',');
  const type = args[0];

  switch (type) {
    case 'array': 
      this.setInputAttribute(attribute, [].concat(value));
      return done();
    
    case 'date':
      this.setInputAttribute(attribute, moment(value, args[1] || '').toDate());
      return done();

    default: return done(false);
  }
}

function mongo_id(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done(); 
  
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(value);
  if (!isMongoId) return done(false);

  this.setInputAttribute(attribute, ObjectId(value));
  return done();
}

function _enum(_attribute, value, args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  return args.split(',').includes(value)
    ? done()
    : done(false, null, { enum: args });
}

Object.defineProperty(_enum, 'name', { value: 'enum' });

function date(_attribute, value, args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  const format = args || 'YYYY/MM/DD';

  return moment(value, format, true).isValid()
    ? done()
    : done(false, null, { format: format });
}

function regex(_attribute, value, args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  const rg = /^\/(?<regex>.+)\/(?<options>[img]*)$/;
  if (!rg.test(args)) {
    return done(new RegExp(args).test(value))
  }

  const match = rg.exec(args);
  return done(new RegExp(match.groups.regex, match.groups.options).test(value));
}

function phone(_attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  return /^[+0-9]{8,12}$/.test(value) 
    ? done()
    : done(false);
}

function email(_attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(value)) {
    // added support domain 3-n level https://github.com/skaterdav85/validatorjs/issues/384
    regex = /^((?:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]|[^\u0000-\u007F])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)+)*$/;
  }

  return regex.test(value) 
    ? done()
    : done(false);
}

function primative(attribute, value, _args, done) {

  if (this.notPresentOrAcceptNullable()) return done();
  
  switch (value) {
    case 'true': 
    this.setInputAttribute(attribute, true);
      return done();

    case 'false': 
      this.setInputAttribute(attribute, false);
      return done();
    
    case 'null':
      this.setInputAttribute(attribute, null);
      return done();
    
    case 'undefined':
      this.setInputAttribute(attribute, undefined);
      return done();
    
    default:
      this.setInputAttribute(attribute, /^\d+$/.test(value) ? Number(value) : value);
      return done();
  }
}

const _deepMap = function _map(o, fn, traceArray = false, traceEnum = false) {
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
        _map(o[newKey], fn, traceArray, traceEnum);
      } 
    }
  }
}

function mongo_guard(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  switch (true) {
    case typeof value === 'string' || value instanceof String:
      this.setInputAttribute(attribute, value.replace(/^\$/, '\\$'))
      return done();
    

    case typeof value === 'object' && value !== null:
      _deepMap(value, item => {
        return  {
          key  : `${item.key}`.replace(/^\$/, '\\$'),
          value: `${item.value}`.replace(/^\$/, '\\$')  
        }
      }, true);
  
      return done();

    default: return done();
  }
}

function min(_attribute, value, args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  const min = parseInt(args);

  if (typeof value === 'number') {
    return value >= min
      ? done()
      : done(false, null, { min: min });
  }

  return value.length >= min
    ? done()
    : done(false, null, { min: min });
}

function max(_attribute, value, args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  const max = parseInt(args);

  if (typeof value === 'number') {
    return max >= value 
      ? done()
      : done(false, null, { max: max });
  }

  return max > value.length
    ? done()
    : done(false, null, { max: max });
}

function uppercase(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  if (!value.toUpperCase) return done(false);

  this.setInputAttribute(attribute, value.toUpperCase());
  return done();
}

function lowercase(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  if (!value.toLowerCase) return done(false);

  this.setInputAttribute(attribute, value.toLowerCase());
  return done();
}

function titlecase(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  if (!value.toUpperCase) return done(false);

  this.setInputAttribute(attribute, _.startCase(value));
  return done();
}

function trim(attribute, value, _args, done) {
  if (this.notPresentOrAcceptNullable()) return done();

  if (!value.trim) return done(false);

  this.setInputAttribute(attribute, value.trim());
  return done();
}

function any(_attribute, _value, _args, done) {
  return done();
}

function _default(attribute, _value, args, done) {
  if (!this.isPresent()) {
    this.setInputAttribute(attribute, args);
  }

  return done();
}

Object.defineProperty(_default, 'name', { value: 'default' });

module.exports = {
  rules: [
    present,
    required,
    required_if,
    required_with,
    required_without,
    required_one_of,
    not_allow,
    not_allow_if,
    unset,
    nullable,
    object,
    boolean,
    numeric,
    integer,
    string,
    array,
    unique,
    to,
    mongo_id,
    _enum,
    date,
    regex,
    phone,
    email,
    primative,
    mongo_guard,
    min,
    max,
    uppercase,
    lowercase,
    titlecase,
    trim,
    any,
    _default
  ],

  customRules: [],

  getRule: function (name) {
    const rule = this.customRules.find(rule => rule.name === name)
      || this.rules.find(rule => rule.name === name);

    if (!rule) {
      throw new Error('Validator `' + name + '` is not defined!')
    }

    return rule;
  },

  register: function (ruleName, fn) {
    Object.defineProperty(fn, 'name', { value: ruleName });

    this.customRules.push(fn);
  }
}
