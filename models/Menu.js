const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 实例化数据模板
const MenuSchema = new Schema({
  role: {
    type:String,
    default:'user'
  },
  menu:{
    path:{
      type:String,
    },
    icon:{
      type:String,
    },
    title:{
      type:String
    },
    children:[
      {
        path:{
          type:String,
        },
        icon:{
          type:String,
        },
        title:{
          type:String
        },
        children:[
          {
            path:{
              type:String,
            },
            icon:{
              type:String,
            },
            title:{
              type:String
            },
          }
        ]
      }
    ]
  }
})

module.exports = Menu = mongoose.model('menus', MenuSchema)