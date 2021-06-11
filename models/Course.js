const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 实例化数据模板
const CourseSchema = new Schema({
  college:{
    type:String
  },
  courseTitle:{
    type:String
  },
  teacher:{
    type:String
  },
  classroom:{
    type:String
  },
  note:{
    type:String,
    default:''
  },
  isPublic:{
    type:Boolean,
    default:true
  }
})

module.exports = Course = mongoose.model('course', CourseSchema)