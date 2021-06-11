const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserMsg = new Schema({
  user: {
    type: String,
    ref: 'users',
    required: true
  },
  phone: {
    type: Number
  }
})