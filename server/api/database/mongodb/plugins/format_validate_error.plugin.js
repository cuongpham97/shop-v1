const { ValidationException } = require('../../../exceptions');
const _ = require('lodash');

function customValidateErrorMessage(errorField) {
  
  const e = errorField;
  const schemaTypes = [
    'String', 'Number', 'Date', 'Buffer', 'Boolean', 'Mixed', 
    'ObjectId', 'Array', 'Decimal128', 'Map', 'Schema'
  ];

  switch (true) {
    case e.message.startsWith('msg: '):
      return e.message.substring(5);

    case e.kind === 'required':
      return `${e.path} is required`;
     
    case e.kind === 'regexp': 
      return `${e.path} is invalid`;

    case e.kind === 'minlength': 
      return `${e.path} can\'t be shorter than ${e.properties.minlength} characters`;
     

    case e.kind === 'maxlength':
      return `${e.path} can\'t be longer than ${e.properties.maxlength} characters`;

    case schemaTypes.includes(_.upperFirst(e.kind)): 
      let kind = _.upperFirst(e.kind);
      return `${e.path} must be ${[...'UEOAI'].includes(kind[0]) ? 'an' : 'a'} \`${ kind === 'ObjectId' ? 'ID' : kind }\``;

    default: 
      return e.message;
  }
}

function formatValidateErrorPlugin(schema, options) {

  schema.post('validate', function (error, doc, next) {

    switch (true) {
      case !error: 
        return next();
      
      case error.name === 'ValidationError':
        let message = _.reduce(error.errors, (result, e) => result.concat(customValidateErrorMessage(e)), []);
        return next(
          new ValidationException({ message: message })
        );

      default: 
        return next(error);
    }
  });
}

module.exports = formatValidateErrorPlugin;
