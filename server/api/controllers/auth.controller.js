const config = require('~config');
const validate = require('~utils/validator');
const { StatusCodes } = require('http-status-codes');
const querystring = require('querystring');
const { ValidationException } = require('~exceptions');
const _ = require('lodash');

exports.authorize = async function (req, res) {
  console.log(req.body);
  console.log(req.query);
  console.log(req.headers);

  // const validation = await validate(req.query, {
  //   'response_type': 'in:token',
  //   'client_id': 'any',
  //   'state': 'any'
  // });

  // if (validation.errors) {
  //   throw new ValidationException({ message: validation.errors });
  // }
  
  const link = `${req.query.redirect_uri}?${querystring.stringify({
    access_token: 'accessTokenFromServer',
    refresh_token: 'refreshTokenFromServer',
    expires_in: 5
  })}`;

  //return res.redirect(link);
}
