const Router = require('koa-router')
const router = new Router()

const Menu = require('../models/Menu')



/*
*@router POST  api/menu/addMenuOne
@desc 添加一级菜单接口
@access  接口是公开的
*/
router.post('/addMenuOne', async ctx => {
  const newMenu = new Menu({});
  newMenu.role = ctx.request.body.role
  if (ctx.request.body.path) newMenu.menu.path = ctx.request.body.path
  if (ctx.request.body.icon) newMenu.menu.icon = ctx.request.body.icon
  if (ctx.request.body.title) newMenu.menu.title = ctx.request.body.title
  await newMenu.save().then(res => {
    ctx.body = {
      status: 200,
      res
    }
  }).catch(err => {
    console.log(err);
  })
})

/*
*@router POST  api/menu/addMenuTwo
@desc 添加二级菜单接口
@access  接口是公开的
*/
router.post('/addMenuTwo', async ctx => {
  const id = ctx.request.body.id
  const findResult = await Menu.findById(id)
  const newMenu = {
    children:[]
  }
  if (ctx.request.body.path) newMenu.path = ctx.request.body.path
  if (ctx.request.body.icon) newMenu.icon = ctx.request.body.icon
  if (ctx.request.body.title) newMenu.title = ctx.request.body.title
  findResult.menu.children.push(newMenu)
  const result = await Menu.findOneAndUpdate(
    {_id:id},
    {$set: {menu: findResult.menu}},
    {new: true}
  )
  ctx.body = {
    status: 200,
    data: result
  }
})

/*
*@router POST  api/menu/addMenuThr
@desc 添加三级菜单接口
@access  接口是公开的
*/
router.post('/addMenuThr', async ctx => {
  const id = ctx.request.body.id
  const findResult = await Menu.findById(id)
  const theMenu = findResult.menu.children
  const newMenu = {}
  if (ctx.request.body.path) newMenu.path = ctx.request.body.path
  if (ctx.request.body.icon) newMenu.icon = ctx.request.body.icon
  if (ctx.request.body.title) newMenu.title = ctx.request.body.title
  const arrResult = theMenu.filter(item => {
    if(item._id == ctx.request.body.twmId) {
      return item.children.push(newMenu)
    }
  })
  const result = await Menu.findOneAndUpdate(
    {_id:id},
    {$set: {menu: findResult.menu}},
    {new: true}
  )
  ctx.body = {
    status: 200,
    data: result
  }
})

/*
*@router POST  api/menu/getAllMenu
@desc 获取菜单接口
@access  接口是公开的
*/
router.post('/getAllMenu', async ctx => {
  const role = ctx.request.body.role
  if(role == 'superAdmin') {
    const findResult = await Menu.find()
    result = findResult.map(item => item.menu)
    ctx.body = {
      status:200,
      data:result,
      allData:findResult
    }
  } else {
    const findResult = await Menu.find({role:role})
    result = findResult.map(item => item.menu)
    ctx.body = {
      status:200,
      data:result,
      allData:findResult
    }
  }
  
  
})

/*
*@router PUT  api/menu/editMenu
@desc 修改菜单权限接口
@access  接口是公开的
*/
router.put('/editMenu',async ctx => {
  const result = await Menu.findOneAndUpdate(
    {_id:ctx.request.body.id},
    {$set: {role: ctx.request.body.role}},
    {new: true}
  )
  if(result) {
    ctx.body = {
      status: 200,
      data:result
    }
  }else {
    ctx.body = {
      status: 500,
      data:"修改失败"
    }
  }
})




module.exports = router.routes()