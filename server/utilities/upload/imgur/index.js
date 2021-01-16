const axios = require('axios');
const FormData = require('form-data');
const config = require('~config');
const moment = require('moment');

let accessToken = config.imgur.ACCESS_TOKEN;
let expiresIn = 0;

function checkToken() {
  if (expiresIn && moment().isBefore(expiresIn)) {
    return null;
  }

  const request = axios.post('https://api.imgur.com/oauth2/token', {
    client_id: config.imgur.CLIENT_ID,
    client_secret: config.imgur.CLIENT_SECRET,
    refresh_token: config.imgur.REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });

  return request
    .then(res => {
      accessToken = res.data.access_token;
      expiresIn = moment().add(28, 'days');
    })
    .catch(err => new Error('Refresh Imgur\'s token failed'));
}

const request = new Proxy(axios, {
  get: function (target, method, receiver) {

    return async function (...args) {
      await checkToken();

      const instance = axios.create({ 
        headers: { Authorization: `Bearer ${accessToken}` } 
      });

      try {
        const response = await instance[method](...args);
        return response.data;

      } catch (e) {
        throw new Error('Call Imgur api failed, args: ' + JSON.stringify([ method, args[0] ]));
      }
    }
  }
});

exports.getAlbum = function (hash) {
  return request.get('https://api.imgur.com/3/album/' + hash);
}

exports.createAlbum = function (name, description = '') {

  let body = new FormData;
  body.append('title', name);
  body.append('description', description);
  
  return request.post('https://api.imgur.com/3/album', body);
}

exports.deleteAlbum = function (hash) {
  return request.delete('https://api.imgur.com/3/album/' + hash);
}

/**
 * 
 * @param {Base64String} image
 * @param {String} type
 * @param {String} name
 * @param {String} [description]
 * @param {String} [album]
 * 
 */
exports.uploadImage = function (data) {

  data = Object.assign({ type: 'base64' }, data)

  if (data.image.replace) {
    data.image = data.image.replace(/^(data:(?:\w+).(?:\w+))\;base64\,/, '');
  }

  let body = new FormData;

  Object.keys(data).forEach(key => body.append(key, data[key]));

  return request.post('https://api.imgur.com/3/upload', data);
}

exports.deleteImage = function (hash) {
  return request.delete('https://api.imgur.com/3/image/' + hash);
}
