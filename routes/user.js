const Router = require('koa-router')
const router = new Router()
const axios = require("axios");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../config/port')
const passport = require('koa-passport')
const path = require('path')
const fse = require('fs-extra')

const User = require('../models/User')

const validatorRegisterInput = require('../validation/register')
const validatorLoginInput = require('../validation/login')

/*
*@router POST  api/users/register
@desc 注册接口地址
@access  接口是公开的
*/
router.post('/register', async ctx => {
  const { errors, isValid } = validatorRegisterInput(ctx.request.body)
  // 判断是否验证通过
  if(!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }
  // 存储到数据库
  const findResult = await User.find({stuId: ctx.request.body.stuId})
  if(findResult.length > 0) {
    ctx.body = {
      msg: '该学号已被注册',
      status: 400
    }
  } else {
    const newUser = new User({});
    if (ctx.request.body.nickname) newUser.nickname = ctx.request.body.nickname
    if (ctx.request.body.name) newUser.name = ctx.request.body.name
    if (ctx.request.body.password) newUser.password = ctx.request.body.password
    if (ctx.request.body.avatar) newUser.avatar = ctx.request.body.avatar
    if (ctx.request.body.permission) newUser.permission = ctx.request.body.permission
    if (ctx.request.body.phone) newUser.phone = ctx.request.body.phone
    if (ctx.request.body.stuId) newUser.stuId = ctx.request.body.stuId
    // 加密
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash
    // 存储到数据库
    await newUser.save()
    .then(user => {
      ctx.body = {
        status: 200,
        user
      }
    }).catch(err => {
      console.log(err);
    })
  }
})

/*
*@router POST  api/users/login
@desc 登录接口地址 返回token
@access  接口是公开的
*/
router.post('/login', async ctx => {
  const { errors, isValid } = validatorLoginInput(ctx.request.body)
  // 判断是否验证通过
  if(!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }
  // 查询
  const findResult =  await User.find({name: ctx.request.body.name});
  const user = findResult[0]
  const password = ctx.request.body.password
  // 判断查没查到
  if(findResult.length == 0) {
    ctx.body = { status: 404, data:'用户不存在'} 
  } else {
    // 查到后验证密码
    const result = bcrypt.compareSync(password, user.password); // true
    // 验证通过
    if(result) {
      // 返回token
      const payload = {
        id: user.id,
        name: user.name,
        permission: user.permission
      }
      const token = jwt.sign(payload, keys.secretOrKey, {expiresIn: 86400})
      ctx.body = {status: 200, success: true, token: "Bearer " + token,permission: user.permission}
    }else{
     ctx.body = {
       status: 404,
       data: '密码错误'
     }
    }
  }
})

/*
*@router GET  api/users/current
@desc 查询个人基本信息 返回信息
@access  接口是私有的
*/
router.get('/current', passport.authenticate('jwt', { session: false }), async ctx => {
  const findResult = await User.find({_id: ctx.state.user.id})
  const userData = {
    name: findResult[0].name,
    nickname: findResult[0].nickname,
    avatar: findResult[0].avatar,
  }
  ctx.body = {
    status: 200,
    data: userData
  }
})

/*
*@router POST  api/users/avatar
@desc 用户头像上传 返回token
@access  接口是公开的
*/
router.put('/avatar', passport.authenticate('jwt', { session: false }), async ctx => { 
  const findResult = await User.find({_id: ctx.state.user.id})
  const userFields = findResult[0]
  const { name, path: filePath, size, type } = ctx.request.files.avatar
  const dest = path.join(__dirname, '../upload', name) // 目标目录，没有没有这个文件夹会自动创建
  await fse.move(filePath, dest, { overwrite: true }) // 移动文件
  const avatar = `http://localhost:8888/${name}`
  if(userFields.avatar === avatar) {
    ctx.body = {
      status:202,
      data: avatar
    }
  }else {
    userFields.avatar = avatar
    const userUpdate = await User.findOneAndUpdate(
      {_id: ctx.state.user.id},
      {$set: userFields},
      {new: true}
    )
    ctx.body = {
      status:200,
      data: userFields.avatar
    }
  }
})

/*
*@router GET  api/users/nickname
@desc 更新个人昵称信息 返回信息
@access  接口是私有的
*/
router.put('/nickname', passport.authenticate('jwt', { session: false }), async ctx => {
  const findResult = await User.find({_id: ctx.state.user.id})
  if(findResult[0].nickname === ctx.request.body.nickname) {
    ctx.body = {
      status: 400,
      msg:'输入昵称与厡昵称一致'
    }
  }else {
    const updateResult = await User.updateOne(
      {_id: ctx.state.user.id},
      {$set: {nickname:ctx.request.body.nickname}},
      {new: true}
    )
    if(updateResult.ok === 1) {
      ctx.body = {
        status: 200,
        msg:'昵称更新成功'
      }
    }
  }
})

/*
*@router GET  api/users/changePhone
@desc 生成验证码返回信息
@access  接口是私有的
*/
router.post('/changePhone', passport.authenticate('jwt', { session: false }), async ctx => {
  const findResult = await User.find({_id: ctx.state.user.id})
    if(findResult[0].phone == ctx.request.body.phone) {
      let identifyCodes= '1234567890'
      let identifyCode = ''
      for (let i = 0; i < 6; i++) {
        identifyCode += identifyCodes[
          Math.floor(Math.random() * (identifyCodes.length - 0) + 0)
        ]
      }
      let params = {
        "msgtype": "text",
        "text": {"content": `验证码${identifyCode}`},
        "at": {"atMobiles": `["${ctx.request.body.phone}"]`,"isAtAll": false}
      }
      let response = await axios({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        url: 'https://oapi.dingtalk.com/robot/send?access_token=18af6d5d99a62a90cdf1ac0a1608a88a42281b8a7f46529354fc27a6424a0298',
        data: params
      })
      if(response.status == 200) {
        ctx.body = {
          status: 200,
          data: identifyCode
        }
      }
    } else {
      ctx.body = {
        status: 404,
        data: '手机号输入有误'
      }
    }
})

/*
*@router GET  api/users/editpwd
@desc 修改密码接口
@access  接口是私有的
*/
router.put('/editpwd', passport.authenticate('jwt', { session: false }), async ctx => {
  let password = ctx.request.body.password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  password = hash
  const updateResult = await User.updateOne(
    {_id: ctx.state.user.id},
    {$set: {password}},
    {new: true}
  )
  if(updateResult.ok === 1) {
    ctx.body = {
      status: 200,
      msg:'密码更新成功'
    }
  }
})



module.exports = router.routes()