//  const mongodb = require('./api/database/mongodb');
// const _ = require('lodash');
// const query = require('./api/middleware/querystring')

// let req = {
//   query: { regexes: "displayName=Ph" }
// };

// query.unflatten(req, null, function(){});

// (async function() {
//   console.log(await mongodb.model('user').paginate({
//     page: 1,
//     pageSize: 5
//   }));
// })()

// function deepMap(object, enumerate, callback) {

//   let keys = enumerate ? Object.getOwnPropertyNames(object) : Object.keys(object);

//   for (let key of keys) {
  
//     if (typeof object[key] === 'object') {
//       deepMap(object[key], enumerate, callback);
//     } else {
//       object[key] = callback(object[key]);
//     }

    
//   }
// }

// let o = { name: { last: 'Phạm', first: 'Cường' }, age: 23 };

// deepMap(o, false, function (value) {
//   console.log(value);
//   return value;
// });


// console.log(o);

// const { ValidationException } = require('./api/exceptions');
// const Joi = require('joi');

// async function validate(value, schema) {
//   let { error, val } = await schema.validate(value, { abortEarly: false });

//   if (error) {

//     let msg = error.details.reduce((acc, info) => acc.concat([info.message]) ,[]);

//     throw new ValidationException({ message: msg });
//   }


//   return val;
// }

// let schema = Joi
//   .object({
//     page:     Joi.number().integer().min(1),
//     pageSize: Joi.number().integer().min(1).max(200)
//   });

// validate({ }, schema);

// validate(
//   , 
//   schema => {
//     return schema.,
//   () => {

//   }
// });


// const mongoose = require('mongoose');

// let schema = new mongoose.Schema({
//   age: {
//     type: String
//   }
// });

// schema.post('validate', function (error, doc, next) {
//   console.log(JSON.stringify(error));
// });

// const model = mongoose.model('user', schema);

// let a = new model({ age: 1000 });

// let error = a.validateSync();

// console.log(a);




// const Joi = require('joi');

// let schema = Joi
//   .object({
//     search:   Joi.string().max(200).default(''),
//     filters:  Joi.object().default({}),
//     regexes:  Joi.object().default({}),
//     fields:   Joi.array().default([]),
//     orders:   Joi.object().default([]),
//     page:     Joi.number().integer().min(1).default(1),
//     pageSize: Joi.number().integer().min(1).max(200).default(80),
//   });

// let d = new Date
// schema.validate({
//   search: 3,
//   filters: {
//     name: 3
//   },
//   fields: [3,4],
//   page: '3',
//   pageSize: 34
// });

// console.log(new Date - d)

// const validate = require('./utilities/validator');

// let value = {
//   search: '1997/03/27',
//   regexes: {
//     name: "$",
//     age: 25
//   },
//   filters: {
//     name: "$5ff2e697f9378$a9ee3fc0c3f"
//   },
//   orders: 'name',
//   fields: [ 5,4],
//   page: 3,
//   pageSize: 300,
//   phone: "99234234234",
//   mail: 'a@gmail.com'
// };

// (async function () {

//   let t = new Date;
//   let validation = await validate(value, {
//     'search'    : 'date:YYYY/MM/DD',
//     'regexes'   : ['object','mongo_guard'],
//     'filters'   : 'object|mongo_guard',
//     'orders'    : 'to:array',
//     'orders.*'  : 'string|min:1|max:100',
//     'fields'    : 'to:array',
//     'fields.*'  : 'string|min:1|max:100',
//     'page'      : 'min:3',
//     'pageSize'  : 'integer',
//     'mail'      : ['required_without:phone', 'email']
//   });

//   console.log(new Date -t);
// })();

// let c = 6;

// Validator.registerAsync('test', function (value, args, attribute, passes) {
//   console.log(this.validator.input.age = 3);
//   passes();
// });

// let input = {
//   age: 6
// }
// let validate = new Validator(input,{
//   age: 'test:5:3'
// }, {
//   test: "sdfsdfsdf"
// });

// validate.checkAsync(()=> { }, null);


// const deepMap = require('./utilities/tools').deepMap;

// deepMap(value, item => {
  
//   console.log(item);

//   if (item.key == 'regexes') {
//     item.value = 10;
//   }

//   return item;
// });

// console.log(value);

// const _ = require('lodash');

// const origin1 = {
//   name: 'Cường',
//   age: 200
// }

// const origin2 = {
//   name: 'Phạm',
//   age: 24
// }

// let query = {



//   fields: from(req, 'query.fields', v => [].concat(v)),

//   filters: from()

// };


// let template = {
//   filters: {
//     from: req.query,
//     validate: 'required|array|min:100|max:200',
//     transform: value => isArray(value) ? value : [value]
//   },

//   regexes: {
//     name: {

//     }
//   }
// }


// let c = {
//   arr: [1,2,3,4,5,6]
// };


//function mapping(template, )

// const _ = require('lodash');

// let value = {
//   name: {
//     first: "Phạm",
//     last: "Cường"
//   },
//   skill: ['M', 'E', 'A', 'N'],
//   age: 23,
//   birthday: [27, 9, [2, 4]],
//   info: {
//     name: {
//       value: {
//         array: [1,2,3,4]
//       },
//       value2: {
//         array: [4,5,7]
//       }
//     },
//     name2: {
//       value: 4
//     }
//   }
// };

// let schema = {
//   name: {
//     first: 'string|min:1|max:200',
//     last: 'required|string'
//   },
//   skill: 'array',
//   'skill.*': 'string',
//   age: 'number',
//   birthday: 'array',
//   'birthday.*.2': 'string',
//   '*.*.*.*.*': 'string'
// }


// function flatten(o) {
//   let result = {};

//   function recursive(o, path) {
//     for (const [key, value] of Object.entries(o)) {
      
//       let currentPath = path ? `${path}.${key}` : key;
  
//       if (typeof value === 'object' && value !== null) {
//         recursive(value, currentPath);
//       }
//       else {
//         result[currentPath] = value;
//       }
//     }
//   }

//   recursive(o, null);

//   return result;
// }



// function tracePath(o, path) {

//   if (_.has(o, path)) return [path];

//   const keys = path.replace(/\[(\w+|\*)\]/g, '.$1').replace(/^\./, '')
//     .split(/\.*(\*)\.*/).filter(Boolean);

//   let matchPath = [''];

//   for (const key of keys) {

//     let temp = [];

//     for (const p of matchPath) {

//       if (key !== '*') {
//         let newPath = p ? `${p}.${key}` : key;
//         _.has(o, newPath) && temp.push(newPath);
//       }

//       if (key === '*') {
//         let ref = p ? _.get(o, p) : o;

//         if (typeof ref === 'object' && ref !== null) {
//           for (let [k, v] of Object.entries(ref)) {
//             let newPath = p ? `${p}.${k}` : k;
//             temp.push(newPath);
//           }
//         }

//       }
//     }

//     if (!temp.length) return [];

//     matchPath = temp;
    
//   }

//   return matchPath;
// }


// function validate(input, rules) {


//   for (let [path, rule] of Object.entries(flatten(rules))) {
    
//     let chain = rule.split('|');
//     let matchPath = tracePath(input, path);

//     console.log( matchPath);

//   }

// }
  

// let t = new Date;
// validate(value, schema);

// console.log(new Date - t);

// const _ = require('lodash');

// let a = [ { name: 4, age: 6} ];

// _.remove(a, '*.age');

// console.log(a);

// const mongoose = require('mongoose')


// const A = new mongoose.Schema({
//   age: {
//     type: String,
//     required: true,
//     validate: {
//       validator: value => false, msg: 'fields name.age is error'
//     }
//   },
//   c: {
//     type: String,
//     required: [true, 'msg: c is reueewrd']
//   }
// });


// const Test = new mongoose.Schema({
//   wrap: {
//     name: {
//       type: A
//     }
//   },
//   b: Number
// });

// Test.pre('save', function() {
//   console.log(this)
// })

// const model = mongoose.model('test', Test);

// (async () => {
//   try {
//     await model.create({
//       wrap:{
//         name: {
//           age: 5
//         }
//       },
//       b: 'ji'
//     });
//   } catch (e) {
//     console.log(JSON.stringify(e));
//   }
// })();

// const image = require('fs').readFileSync("C:/Users/C/Desktop/125776990_4000342333361903_5202260670226130935_n.jpg");

// const CLIENT_ID = '05e575fdb8dbcdd';
// const CLIENT_SECRET = '9a11e838176a20cb7a3df6046f05297062957a1a';

// const axios = require('axios');
// const FormData = require('form-data');

// (async function() {


//   //get access token

//   let data = new FormData;
//   data.append('image', image);
//   // //data.append('client_secret', CLIENT_SECRET);

//   // console.log(data);

//   const request = axios.create({
//     baseURL: 'https://api.imgur.com/3/image',
//     headers: {'Authorization': 'Bearer 037d39692b02dba51214d257d20982d9d1511ff2'}
//   });

//   request.post('/', image)
//    .then(res => console.log(res.data))
//    .catch(error => console.log(error.response.data))


// })();

// const axios = require('axios');

// axios.get()
//   .then(res => console.log(res.data))
//   .catch(e => console.log)

// const config = require('./config');
// const open = require('open');
// const http = require('http');
// const express = require('express');
// const _ = require('lodash');

// const PORT = 3800;

// const app = express();
// app.get('/catchtoken', (req, res) => {
  
//   if (_.isEmpty(req.query)) {
//     return res.send(`<script>window.location.href="http://localhost:3800/catchtoken?" + window.location.hash.substring(1)</script>`);
//   }

//   console.log(req.query);
  
// });

// const server = http.createServer(app);

// server.on('listening', function () {
//   open(`https://api.imgur.com/oauth2/authorize?client_id=${config.Imgur.client_id}&response_type=token`);
// });

// function generateToken() {



//   server.listen(PORT);

// }

// generateToken();

// const imgur = require('./utilities/imgur');

// (async function () {

//   const image = require('fs').readFileSync('z.txt').toString();


//   console.log(await imgur.uploadImage({
//     image: image,
//     name: 'user.name',
//     description: 'user upload'
//   }));

// })();

// const mongoose = require('mongoose');

// const NestedSchema = new mongoose.Schema({
//   value: Number
// });

// NestedSchema.post('validate', function (error, doc, next) {
//   next();
// })

// const UserSchema = new mongoose.Schema({
//   name: NestedSchema
// });

// UserSchema.post('validate', function (error, doc, next) {
//   console.log(this.parent())
//   next();
// })

// const User = mongoose.model('user', UserSchema);

// (async function () {
//   await User.create({
//     name: {  value: 'sdfsdf' }
//   })
// })();

// function AuthCheck() {
//   this.id = '';
//   this.role = '';
//   this.can = [];

//   this.check = function (roles, id) {

//     const ownerId = !this.id || this.id === id;
//     const hasRole = !this.role || _.has(roles, role);
//     const hasPermission = true// TODO: check later !this.can.length || 
  
//     return [ownerId, hasRole, hasPermission].every(Boolean);
//   }
// }

// function MiddlewareChain(checker) {
  
//   this.ownerId = function () {
//     checker.
//   }

// }

// function auth(type) {
//   return true;
// }

// const config = require('./config');
// const Guard = require('~middleware/guard');
// const HttpServer = require('./http-server');
// const express = require('express');
// const jwt = require('~utils/jwt');
// const app = express();

// app.get('/:id', 

// function (req, res, next) {
//   req.headers['authorization'] = jwt.createAccessToken({
//     id: 500,
//     roles: {
//       admin: {
//         'user.create': true,
//         'product.create': false
//       },
//       shiper: {
//         'user.read': true,
//         'order.create': true
//       },
//       saler: {

//       }
//     }
//   });
//   return next();
// },

//   guard.auth('admin').can('admin.user.create|*.user.delete|admin').ownerId('params.id')

// ,function (req, res, next) {
  
//   console.log(req.admin)

// }

// );

// const server = new HttpServer(app);
// server.listen(80);

// const cf = require('./config');
// const HttpServer = require('./http-server');
// const express = require('express');
// const jwt = require('~utils/jwt');
// const app = express();

// const guard = require('~middleware/guard');

// app.get('/:id', 

// function (req, res, next) {

//   req.headers['authorization'] = jwt.createAccessToken({ 
//     id: '60103f8a498cf31904832133',
//     version: '1611677041158'
//   });

//   return next();
// },

// guard.auth('user').ownerId('params.id'),

// function (req, res, next) {
//   console.log(req.user);
// });

// let server = new HttpServer(app);
// server.listen(80);

// const role = {
//   name: "superadmin",
//   level: 1,
//   permission: {
//     users: ['create', 'read', 'update', 'delete'],
//     orders: ['create', 'read', 'update', 'delete']
//   }
// }

// const roles = ['superadmin', 'shipper']


// guard.auth('admin').can('users.create')

// function can(action) {

//   const [resource, permission] = action.split('.');

//   return async function (req, res, next) {

//   }
//}

// let p0 = Promise.resolve(Promise.resolve(0)).catch(console.log)
// let p1 = Promise.resolve([1]);
// let p3 = new Promise((resolve, reject) => {
//   console.log('3')
//   reject(2);
// })
// let p2 = Promise.resolve(2);

// function concat(...promises) {
 
//   return promises.reduce((p1, p2) => p1.then(v1 => p2.then(v2 => v1.concat(v2))), Promise.resolve([]));
// }

// let v = concat(p0, p1, p3, p2).then(console.log)

// const cf = require('./config');
// const roleService = require('./api/services/role.service');

// (async function () {

//   const newRole = await roleService.create({
//     name: "admin",
//     level: 2,
//     permission: {
//         "user": [
//           "create",
//           "read",
//           "update",
//           "delete"
//       ],
//       "product": [
//           "create",
//           "reate",
//           "update",
//           "delete"
//       ],
//       "order": [
//           "create",
//           "read",
//           "update",
//           "delete"
//       ]
//     },
//     active: true
//   } ,"6016a56e860fe32b64380ab9");


//   console.log(newRole)

// })();

const cf = require('./config');

const { init, mongodb } = require('~database');

init().then(async() => {
  console.log('after connect');
  let user = await mongodb.model('user').find();

  console.log(user);

});