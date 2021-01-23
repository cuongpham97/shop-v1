const UserSchema = require('../schemas/user.schema');

module.exports = {
  schema: UserSchema, apply: mongoose => mongoose.model('user', UserSchema)
}
