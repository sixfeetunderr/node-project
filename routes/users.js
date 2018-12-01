var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var url = 'mongodb://127.0.0.1:27017';

// router.get('/',function(req,res,next){
//   res.render('phone');
// })
//访问 users 
router.get('/', function(req, res, next) {
  var page = parseInt(req.query.page) || 1;
  var pageSize = parseInt(req.query.pageSize) || 5;
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
        db.collection('user').find().count(function(err,num){
          if(err){
            cb(err)
          }else{
            totalSize = num;
            cb(null);
          }
        })
      },
      function(cb){
      db.collection('user').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err,data){
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
          res.render('users',{
            list:result[1],
            totalPage:totalPage,
            currentPage:page,
            pageSize:pageSize
          })
        }
    })
  })
})

//   MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
//     if(err){
//       console.log('链接数据库失败',err);
//       res.render('error',{
//         message:'链接数据库失败',
//         error:err
//       });
//       return;
//     }
//     // 连接数据库
//     var db = client.db('project');
//     db.collection('user').find().toArray(function(err,data){
//       if(err){
//         console.log('查询用户数据失败',err);
//         res.render('error',{
//           message:'查询失败',
//           error:err
//         })
//       }else{
//         console.log(data);
//         res.render('users',{
//           list:data
//         });
//       }
//       client.close();
//     })
//   })
//   // 渲染用户列表
//   // res.render('users');
// });


router.post('/login',function(req,res){
  // 获取传递参数
  // 验证参数有效性
  //连接数据库验证
  // console.log(req.body);
  var username = req.body.name;
  var password = req.body.pwd;
  if(!username){
    res.render('error',{
      message:"用户名不能为空",
      error:new Error("用户名不能为空")
    })
    return;
  }
  if(!password){
    res.render('error',{
      message:"密码不能为空",
      error:new Error("密码不能为空")
    })
    return;
  }

  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
      if(err){
        console.log('连接失败',err);
        res.render('error',{
          message:'连接失败',
          error:err
        })
        return;
      }
      var db = client.db('project');
  //     db.collection('user').find({
  //       username:username,
  //       password:password
  //     }).count(function(err,num){
  //       if(err){
  //         console.log('查询失败',err);
  //         res.render('error',{
  //           message:'查询失败',
  //           error:err
  //         })
  //       }else if(num > 0){
  //           //跳转首页
  //           // res.render('index');

  //           res.redirect('http://localhost:3000/')
  //       }else{
  //           res.render('error',{
  //             message:'登录失败',
  //             error:new Error('登录失败')
  //           })
  //       }
  //     })
  //     client.close();
      db.collection('user').find({
        username:username,
        password:password
      }).toArray(function(err,data){
        if(err){
          console.log('查询失败',err);
          res.render('error',{
            message:'查询失败',
            error:err
          })
        }else if(data.lengtrh <= 0){
            res.render('error',{
              message:'登录失败',
              error:new Error('登录失败')
            })
        }else{
          res.cookie('nickname',data[0].nickname,{
            maxAge: 60 * 60 * 1000
          });
          res.redirect('/');
        }
        client.close();
      })
  })
});

router.post('/register',function(req,res){
  var name = req.body.name;  
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);  
  var sex = req.body.sex;  
  var isAdmin = req.body.isAdmin === '是' ? true : false;  
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
        db.collection('user').find({username:name}).count(function(err,num){
          if(err){
            cb(err)
          }else if(num > 0){
            cb(new Error('已经注册'))
          }else{
            cb(null);
          }
        })
      },
      function(cb){
        db.collection('user').insertOne({
          username:name,
          password:pwd,
          nickname:nickname,
          age:age,
          sex:sex,
          isAdmin:isAdmin
        },function(err){
          if(err){
            cb(err);
          }else{
            cb(null);
          }
        })
      }
    ],function(err,result){
      if(err){
        res.render('error',{
          message:'错误',
          error:err
        })
      } else{
        res.redirect('/login.html');
      }
      client.close();
    })
  })
})
//   MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
//     if(err){
//       res.render('error',{
//         message:'连接失败',
//         error:err
//       })
//       return;
//     }
//     var db = client.db('project');
//     db.collection('user').insertOne({
//       username:name,
//       password:pwd,
//       nickname:nickname,
//       age:age,
//       sex:sex,
//       isAdmin:isAdmin
//     },function(err){
//       if(err){
//         console.log('注册失败');
//         res.render('error',{
//           message:'注册失败',
//           error:err
//         })
//       }else{
//         //成功 跳转登录
//         res.redirect('/login.html');
//       }
//       client.close();
//     })
//   })
// });
// 删除
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
    db.collection('user').deleteOne({
      _id : ObjectId(id)
    },function(err,data){
      if(err){
        res.render('error',{
          message:'删除失败',
          error:err
        })
      }else{
        res.redirect('/users');
      }
        client.close();
    })
  }) 
})




module.exports = router;
