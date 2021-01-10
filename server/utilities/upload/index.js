const imgur = require('./imgur');

exports.uploadImage = async function (image, name = '', description = 'user avatar') {

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
    meta: {
      id: data.id,
      deleteHash: data.deletehash,
      description: data.description
    }
  };
}

exports.deleteImage = async function (image) {
  return typeof image === 'string'
    ? await imgur.deleteImage(image)
    : await imgur.deleteImage(image.meta.deleteHash);
} 
