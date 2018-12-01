
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var url = 'mongodb://127.0.0.1:27017';

router.get('/', function(req, res, next) {
  var page = parseInt(req.query.page) || 1;
  var pageSize = parseInt(req.query.pageSize) || 4;
  var totalSize = 0;
  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      res.render('error',{
        message:'链接失败',
        error:err
      })
      return;
    }
    var db = client.db('project');
    async.series([
      function(cb){
        db.collection('phone').find().count(function(err,num){
          if(err){
            cb(err)
          }else{
            totalSize = num;
            cb(null);
          }
        })
      },
      function(cb){
      db.collection('phone').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err,data){
        if(err){
          cb(err)
        }else{
          cb(null,data)
        }
      })
    }
    ],function(err,result){
        if(err){
          res.render('error',{
            message:"错误",
            error:err
          })
        }else{
          var totalPage = Math.ceil(totalSize / pageSize);
          res.render('phone',{
            list:result[1],
            totalPage:totalPage,
            currentPage:page,
            pageSize:pageSize
          })
        }
    })
  })
})

// router.get('/',function(req,res,next){
//   MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
//     if(err){
//       console.log('链接数据库失败');
//       res.render('error',{
//         message:'连接数据库失败',
//         error:err
//       })
//       return;
//     }
//     var db = client.db('project');
//     db.collection('phone').find().toArray(function(err,data){
//       if(err){
//         console.log('查找失败',err);
//         res.render('error',{
//           message:'查询失败',
//           error:err
//         })
//       }else{
//         console.log(data);
//         res.render('phone',{
//           list:data
//         });
//       }
//       client.close();
//     })
//   });
// });


router.get('/delete',function(req,res){
  var id = req.query.id;
  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      res.render('error',{
        message:'连接失败',
        error:err
      })
      return;
    }
    var db = client.db('project');
    db.collection('phone').deleteOne({
      _id : ObjectId(id)
    },function(err,data){
      if(err){
        res.render('error',{
          message:'删除失败',
          error:err
        })
      }else{
        res.redirect('/phone');
        // res.send('<script>location.reload();</script>');
      }
        client.close();
    })
  }) 
})


module.exports = router;