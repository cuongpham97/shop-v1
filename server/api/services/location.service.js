const { Validator } = require('~utils/validate');
const location = require('~storage/data/location');

exports.getProvinces = function () {
  return location.map(province => {
    return { 
      code: province.code,
      name: province.name
    };
  });
}

exports.getDistrictsAndWards = function (provinceCode) {
  const province = location.find(province => province.code === provinceCode);

  if (!province) {
    throw new NotFoundException({ message: 'Province code does not exist' });
  }

  return province.districts;
}

function _buildLocationObject(provinceCode, districtCode, wardCode) {
  const province = location.find(province => province.code === provinceCode);
  
  if (!province) {
    return undefined;
  }

  const district = province.districts.find(district => district.code === districtCode);

  if (!district) {
    return undefined
  }

  const ward = district.wards.find(ward => ward.code === wardCode);

  if (!ward) {
    return undefined;
  }

  return {
    province: { 
      code: province.code, 
      name: province.name 
    },
    district: { 
      code: district.code, 
      name: district.name 
    },
    ward: { 
      code: ward.code, 
      name: ward.name 
    }
  };
}

Validator.register('location', function (attribute, value, _args, done) {
  
  if (this.notPresentOrAcceptNullable()) return done();

  const isObject = typeof value === 'object' && value !== null;

  if (!isObject) {
    return done(false);
  }

  const { province, district, ward, street } = value;

  const location = _buildLocationObject(province, district, ward);

  if (!location) {
    return done(false);
  }

  location.street = street;
  _.set(this.input, attribute, location);

  return done();
});
