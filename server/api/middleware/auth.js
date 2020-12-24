const _ = require('lodash');
const jwt = require('../../utilities/jwt');

function getTokenFromHeader(req) {
  let token = req.headers['authorization'] || req.headers['x-access-token'];

  if (!token) {
    throw Error('Access token not provided');
  }

  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  return token;
}

async function extractToken(token) {
  let extracted = await jwt.verifyAccessToken(token);

  return extracted;
}

function PermissionChecklist() {
  this.id = '';
  this.role = '';
  this.permissions = [];

  this.check = function (scopes, id) {

    let isOwnerId = !this.id || this.id == id; 

    let isHasRole = !this.role || (this.role == scopes.name);
    
    let isHasPermission = !this.permissions.length || this.permissions.every(
      p =>  _.get(scopes.permissions, p) == true
    );
    
    return [isOwnerId, isHasRole, isHasPermission].every(Boolean);
  }
}

function PermissionChain(checklist) {
  
  this.isOwnerId = function(id) {
    checklist.id = id;
    return this;
  }

  this.hasRole = function(role) {
    checklist.role = role;
    return this;
  }

  this.hasPermission = function(...permissions) {
    checklist.permissions.concat(permissions);
    return this;
  }
}

module.exports = (accountType) => {

  if (!['user', 'admin'].includes(accountType)) {
    throw Error(`Wrong argument ${accountType}`);
  }

  let checklist = new PermissionChecklist();
  let chain = new PermissionChain(checklist);

  let middleware = async function(req, res, next) {

    let token = getTokenFromHeader(req);
    let extracted = await extractToken(token);

    //merge extracted token to req.user || req.admin
    req[accountType] = Object.assign(req[accountType] || {}, extracted);

    let expected = checklist.check(req[accountType].role, req[accountType].id);

    if (expected) {
      return next();
    }

    throw Error('Unauthorized');
  }

  return Object.assign(middleware, chain);
}
