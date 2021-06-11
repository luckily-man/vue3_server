const Validator = require('validator')
const isEmpty = require('../config/isEmpty')

module.exports = function validatorRegisterInput(data) {
  let errors = {}

  data.name = !isEmpty(data.name) ? data.name : ''
  
  data.password = !isEmpty(data.password) ? data.password : ''
  

  if(!Validator.isLength(data.name, {min:2, max: 30})) {
    errors.name = "名字长度不能小于两位且不能超过30位"
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = '名字不能为空'
  }

  

  if (Validator.isEmpty(data.password)) {
    errors.password = '密码不能为空'
  }

  if (!Validator.isLength(data.password, {min:3, max: 30})) {
    errors.password = '密码长度不能小于3位且不能超过30位'
  }


  return {
    errors,
    isValid: isEmpty(errors)
  }
}