const Router = require('koa-router')
const router = new Router()

const User = require('../models/User')

/*
*@router GET  api/admin/all
@desc 查询所有学生接口
@access  接口是公开的
*/
router.post('/all', async ctx => {
  const role = ctx.request.body.role
  let findResult
  if(role == 'superAdmin') {
    findResult = await User.find()
  }else {
    findResult = await User.find({permission:'user'})
  }
  if(findResult.length) {
    ctx.body = {
      status: 200,
      data: findResult
    }
  }else {
    ctx.body = {
      status: 400,
      data: "没有数据"
    }
  }
})

/*
*@router GET  api/admin/select
@desc 查询信息接口
@access  接口是公开的
*/
router.post('/select', async ctx => {
  const keyword = ctx.request.body.keyword
  const data = ctx.request.body.data
  const role = ctx.request.body.role
  let findResult
  if(keyword == 'name' && role == 'superAdmin') {
    findResult = await User.find({name:new RegExp(data)})
  }else if(keyword == 'name' && role !== 'superAdmin') {
    findResult = await User.find({name:new RegExp(data),permission:role})
  }else if(keyword == 'stuId' && role == 'superAdmin') {
    findResult = await User.find({stuId:new RegExp(data)})
  }else if(keyword == 'stuId' && role !== 'superAdmin') {
    findResult = await User.find({stuId:new RegExp(data),permission:role})
  } else if(keyword == 'phone' && role == 'superAdmin'){
    findResult = await User.find({phone:new RegExp(data),permission:role})
  }else {
    findResult = await User.find({phone:new RegExp(data)})
  }
  if(findResult.length) {
    ctx.body = {
      status:200,
      data:findResult
    }
  }else {
    ctx.body = {
      status:404,
      data:"没找到内容"
    }
  }
})

/*
*@router GET  api/admin/pageOption
@desc 分页接口
@access  接口是公开的
*/
router.post('/pageOption', async ctx => {
  const role = ctx.request.body.role
  let currentPage = parseInt(ctx.request.body.currentPage) || 1;
  let pageSize=parseInt(ctx.request.body.pageSize)||5;
  offset=(currentPage-1)*pageSize
  let findResult
  if (role == 'superAdmin') {
    findResult = await User.find().skip(offset).limit(pageSize)
  }else {
    findResult = await User.find({permission:'user'}).skip(offset).limit(pageSize)
  }
  ctx.body = {
    status: 200,
    data: findResult
  }
})

/*
*@router GET  api/admin/delOne
@desc 删除某个用户接口
@access  接口是公开的
*/
router.post('/delOne', async ctx => {
  const delResult = await User.deleteOne({_id:ctx.request.body.id})
  if(delResult.ok === 1) {
    ctx.body = {
      status: 200,
      msg: '删除成功'
    }
  }else {
    ctx.body = {
      status: 500,
      msg: '删除失败'
    }
  }
})

/*
*@router PUT  api/admin/editPer
@desc 更新个人昵称信息 返回信息
@access  接口是私有的
*/
router.put('/editPer', async ctx => {
  const updateResult = await User.updateOne(
    {_id: ctx.request.body.id},
    {$set: {permission:ctx.request.body.permission}},
    {new: true}
  )
  if(updateResult.ok == 1) {
    ctx.body = {
      status: 200,
      msg: '更新成功'
    }
  }else{
    ctx.body = {
      status: 200,
      msg: '更新成功'
    }
  }
})



module.exports = router.routes()