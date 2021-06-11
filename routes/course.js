const Router = require('koa-router')
const router = new Router()

const Course = require('../models/Course')

/*
*@router POST  api/course/addCourse
@desc 添加课程接口
@access  接口是公开的
*/
router.post('/addCourse', async ctx => {
  const newObj = ctx.request.body
  const findResult = await Course.find()
  const newCourse = new Course({});
  if (newObj.college) newCourse.college = newObj.college
  if (newObj.courseTitle) newCourse.courseTitle = newObj.courseTitle
  if (newObj.teacher) newCourse.teacher = newObj.teacher
  if (newObj.classroom) newCourse.classroom = newObj.classroom
  if (newObj.note) newCourse.note = newObj.note
  if (newObj.isPublic) newCourse.isPublic = newObj.isPublic
  function sets(arr,newArr) {
    return arr.filter(item=>{
      if(item.college == newArr.college && item.courseTitle == newArr.courseTitle && item.teacher == newArr.teacher && item.classroom == newArr.classroom && item.note == newArr.note ) {
        return item
      }
    })
  }
  const result = sets(findResult,newObj)
  if(result.length) {
    ctx.body = {
      status: 400,
      msg:'该课程已存在'
    }
  }else {
    await newCourse.save().then(res => {
      ctx.body = {
        status: 200,
        res
      }
    }).catch(err => {
      console.log(err);
    })
  }
})

/*
*@router POST  api/course/selCourse
@desc 获取课程接口
@access  接口是公开的
*/
router.post('/selCourse',async ctx => {
  const message = ctx.request.body.message
  const type = ctx.request.body.type
  let findResult
  if(type === 'college') {
    findResult == await Course.find({college:new RegExp(message)})
  }else if(type === 'courseTitle'){
    findResult = await Course.find({courseTitle:new RegExp(message)})
  }else if(type === 'teacher') {
    findResult = await Course.find({teacher:new RegExp(message)})
  }else if(type === 'classroom') {
    findResult = await Course.find({classroom:new RegExp(message)})
  }else {
    findResult = await Course.find()
  }
  if(findResult.length) {
    ctx.body = {
      status:200,
      data:findResult
    }
  }else {
    ctx.body = {
      status:202,
      msg:'未查到数据'
    }
  }
})

/*
*@router DELETE  api/course/delCourse?id=xxx
@desc 删除某个课程接口
@access  接口是公开的
*/
router.delete('/delCourse', async ctx => {
  const delResult = await Course.deleteOne({_id:ctx.query.id})
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
*@router PUT  api/course/updatCourse
@desc 修改某个课程接口
@access  接口是公开的
*/
router.put('/updatCourse', async ctx => {
  const Obj = ctx.request.body
  const id = Obj._id
  let findResult = await Course.findOne({_id:id})
  if(Obj.courseTitle) findResult.courseTitle = Obj.courseTitle
  if(Obj.college) findResult.college = Obj.college
  if(Obj.classroom) findResult.classroom = Obj.classroom
  if(Obj.isPublic) findResult.isPublic = Obj.isPublic
  if(Obj.note) findResult.note = Obj.note
  const updataResult = await Course.updateOne(
    {_id:id},
    {$set:findResult},
    {new: true}
  )
  if(updataResult.ok == 1) {
    ctx.body = {
      status: 200,
      data: '更新成功'
    }
  }else{
    ctx.body = {
      status: 400,
      data: '更新失败'
    }
  }
})

/*
*@router GET  api/course/pageOption
@desc 分页接口
@access  接口是公开的
*/
router.post('/pageOption', async ctx => {
  let currentPage = parseInt(ctx.request.body.currentPage) || 1;
  let pageSize=parseInt(ctx.request.body.pageSize)||5;
  offset=(currentPage-1)*pageSize
  const findResult = await Course.find().skip(offset).limit(pageSize)
  ctx.body = {
    status: 200,
    data: findResult
  }
})


module.exports = router.routes()