const { ValidationException } = require('~exceptions');
const _ = require('lodash');

function customErrorMessage(path, error) {

  const e = error;

  const schemaTypes = [
    'String', 'Number', 'Date', 'Buffer', 'Boolean', 'Mixed',
    'ObjectId', 'Array', 'Decimal128', 'Map', 'Schema'
  ];

  switch (true) {
    case e.message && e.message.startsWith('msg: '):
      return e.message.substring(5);

    case e.kind === 'required':
      return `"${path}" is required`;

    case e.kind === 'regexp':
      return `"${path}" is invalid`;

    case e.kind === 'minlength':
      return `"${path}" must be at least ${e.properties.minlength} characters`;

    case e.kind === 'maxlength':
      return `"${path}" may not be greater than ${e.properties.maxlength} characters`;

    case e.kind === 'min':
      return `"${path}" must be at least ${e.properties.min}`;

    case e.kind === 'max':
      return `"${path}" may not be greater than ${e.properties.max}`;

    case e.kind === 'enum':
      return `"${path}" must be one of \`${e.properties.enumValues.join(', ')}\``;

    case schemaTypes.includes(_.upperFirst(e.kind)):
      let kind = _.upperFirst(e.kind);
      return `"${path}" must be ${[...'UEOAI'].includes(kind[0]) ? 'an' : 'a'} ${kind === 'ObjectId' ? 'object ID' : kind.toLowerCase()}`;

    default:
      return e.message;
  }
}

function afterValidate(error, _doc, next) {

  if (this.parent() || !error) return next();

  if (error.name === 'ValidationError') {

    const message = [];

    for (const [path, err] of Object.entries(error.errors)) {
      if (err.errors) continue;
      message.push(customErrorMessage(path, err));
    }

    return next(new ValidationException({ message: message }));
  }

  return next(error);
}

module.exports = (schema) => schema.post('validate', afterValidate);
