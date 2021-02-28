const validate = require('~utils/validate');
const { mongodb } = require('~database');
const pricing = require('~libraries/pricing');

exports.create = async function (data, customer) {

  data.customer = customer;

  const validation = await validate(data, {
    'customer': 'required|object',
    'customer._id': 'required|mongo_id',
    'customer.groups': 'required|array',
    'customer.groups.*': 'mongo_id',
    'items': 'required|array|min:1',
    'items.*.product': 'required|mongo_id',
    'items.*.sku': 'required|mongo_id',
    'items.*.quantity': 'required|integer|min:1'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  const items = validation.result.items;
  customer = validation.result.customer;
}
