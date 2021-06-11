const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 实例化数据模板
const UserSchema = new Schema({
  nickname: {
    type: String,
    default:''
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  stuId: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default:''
  },
  date: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: ''
  },
  permission: {
    type: String,
    default: 'user'
  }
})

module.exports = User = mongoose.model('users', UserSchema)