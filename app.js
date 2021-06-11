const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')
const passport = require('koa-passport')
const cors = require('koa-cors')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const path = require('path')

const port = require('./config/port').port

const app = new Koa()

// 处理跨域
app.use(cors({origin: '*'}))
app.use(koaBody({
  multipart: true
}))

const router = new Router()
app.use(bodyParser())



app.use(koaStatic(path.join(__dirname, './upload/')))

// 连接数据库
const db = require('./config/port').mongoURL

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> {
    console.log('mongoosedb connect success');
  })
  .catch(()=> {
    console.log(err);
  })

// 配置接口localhost:8888/api/xxx
const users = require('./db/index').users
const admin = require('./db/index').admin
const menu = require('./db/index').menu
const course = require('./db/index').course
router.use('/api/users', users)
router.use('/api/admin', admin)
router.use('/api/menu', menu)
router.use('/api/course', course)

app.use(passport.initialize())
app.use(passport.session())

// // 回调到config文件中
require('./config/passport')(passport)
  
// 配置路由
app.use(router.routes()).use(router.allowedMethods())


app.listen(port, () => {
  console.log(`server started success on ${port}`);
})