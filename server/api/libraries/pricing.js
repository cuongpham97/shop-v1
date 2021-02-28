const moment = require('moment');

function _additionPrice(product, sku) {
  if (product.template === 'VARIANT') {
    return 0;
  }

  const { sign, value } = sku.additionPrice;

  return (sign === '-' ? -1 : 1) * value;
}

function _nomarlPrice(product, sku) {
  let nomarlPrice = product.pricingTemplate === 'PRODUCT' 
    ? product.price 
    : sku.price 

  return nomarlPrice + _additionPrice(product, sku);
}

function _hasGroup(customer, groupId) {
  if (!groupId) return true;
  return customer && customer.groups && customer.groups.find(i => i.equals(groupId));
}

function _isInTime(effectiveDate, expiryDate) {
  const now = moment();
  return (!effectiveDate || now.isAfter(effectiveDate)) && (!expiryDate || now.isBefore(expiryDate));
}

function _salePrice(product, sku, customer) {

  let special = product.pricingTemplate === 'PRODUCT' ? product.special : sku.special;

  special = special.filter(line => _hasGroup(customer, line.customerGroup) && _isInTime(line.effectiveDate, line.expiryDate));

  if (!special.length) {
    return undefined;
  }

  special = special.sort((a, b) => a.priority - b.priority);
  
  return special[0].salePrice + _additionPrice(product, sku);
}

function _percentageSale(price, salePrice) {
  const percent = (price - salePrice) / price * 100; 
  return percent.toFixed(2);
}

function _discountQueue(product, sku, customer) {
  let discount = product.pricingTemplate === 'PRODUCT' ? product.discount : sku.discount;
  discount = discount.filter(line => _hasGroup(customer, line.customerGroup) && _isInTime(line.effectiveDate, line.expiryDate));
  discount.sort((a, b) => a.quantity - b.quantity || a.priority - b.priority);
  return discount;
}

function _discount(product, sku, quantity, customer) {
  const discount = _discountQueue(product, sku, customer).find(line => line.quantity === quantity);
  return discount ? discount.value : 0;
}

exports.expectedPrice = function (product, sku, customer = null) {

  const nomarlPrice = _nomarlPrice(product, sku);
  const salePrice = _salePrice(product, sku, customer);
  const percentageSale = _percentageSale(nomarlPrice, salePrice);
  const discountQueue = _discountQueue(product, sku, customer);
  
  return {
    nomarlPrice,
    discountQueue, 
    salePrice,
    percentageSale
  };
}

exports.productLinePrice = function (product, sku, quantity, customer = null) {
  
  const nomarlPrice = _nomarlPrice(product, sku);
  const salePrice = _salePrice(product, sku, customer);
  const percentageSale = _percentageSale(nomarlPrice, salePrice);
  const discount = _discount(product, sku, quantity, customer);
  const price = (salePrice || nomarlPrice) - discount;
  const subtotal = price * quantity;

  return {
    price,
    nomarlPrice,
    discount, 
    salePrice,
    percentageSale,
    subtotal
  };
}
