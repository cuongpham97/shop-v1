const imgur = require('./imgur');
const report = require('~utils/report');

exports.uploadImage = async function (image, name = '', description = '') {

  const response = await imgur.uploadImage({
    name: name,
    image: image,
    description: description
  });

  let data = response.data;

  return {
    name: data.name,
    type: data.type,
    url: data.link,
    width: data.width,
    height: data.height,
    size: data.size,
    imgur: {
      id: data.id,
      deleteHash: data.deletehash,
    },
    description: data.description
  };
}

exports.deleteImage = async function (image) {
  
  const request = typeof image === 'string'
    ? imgur.deleteImage(image)
    : imgur.deleteImage(image.imgur.deleteHash);

  return request.catch(e => report.error(e));
} 
