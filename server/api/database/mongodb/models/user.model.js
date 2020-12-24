const UserSchema = require('../schemas/user.schema');

exports.apply = mongoose => mongoose.model('user', UserSchema, 'user');
