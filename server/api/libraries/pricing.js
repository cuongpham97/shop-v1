const moment = require('moment');

function _originPrice(product, sku) {

  return product.pricingTemplate === 'PRODUCT' ? product.price : sku.price;
}

function _hasGroup(customer, groupId) {
  if (!groupId) return true;

  return customer && customer.groups && customer.groups.find(i => i.equals(groupId));
}

function _isInTime(effectiveDate, expiryDate) {
  const now = moment();
  return (!effectiveDate || now.isAfter(effectiveDate)) && (!expiryDate || now.isBefore(expiryDate));
}

function _orderByPriority(array) {
  return array.sort((a, b) => a.priority - b.priority);
}

function _salePrice(product, sku, customer) {
  
  const template = product.pricingTemplate === 'PRODUCT' 
    ? 'PRODUCT' 
    : 'VARIANT';

  let special = template === 'PRODUCT' ? product.special : sku.special;

  special = special.filter(line => _hasGroup(customer, line.customerGroup) && _isInTime(line.effectiveDate, line.expiryDate));

  if (!special.length) {
    return undefined;
  }

  return _orderByPriority(special)[0].salePrice;
}

exports.calculateSellingPrice = function (product, sku, quantity, customer = null) {
  
  const price = _originPrice(product, sku);
  const salePrice = _salePrice(product, sku, customer);

  console.log(salePrice);
}

exports.calculateExpectedPrice = function (product, sku, customer = null) {

}

exports.calcTotalPrice = function (product, sku, quantity, tax = null, customerGroup = null) {
}
