const imgur = require('./imgur');

exports.uploadImage = async function (imageData, name = '', description = '') {

  const response = await imgur.uploadImage({
    name: name,
    image: imageData,
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
  
  return request = typeof image === 'string'
    ? imgur.deleteImage(image)
    : imgur.deleteImage(image.imgur.deleteHash);
} 
