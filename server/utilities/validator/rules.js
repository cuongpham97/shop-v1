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

Validator.registerAsyncImplicit('present', function (field, value, args, done) {

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

Validator.registerAsyncImplicit('not_allow', function(_field, _value, _args, done) {
  return done(false);
});

Validator.registerAsyncImplicit('not_allow_if', function(field, _value, args, done) {
  
  const [orField, orValue] = args.split(',');

  return _.get(this.input, orField) == orValue && _.has(this.input, field)
    ? done(false, null, { or: orField, value: orValue })
    : done();
});
