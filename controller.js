let query = require('./model.js');
const router = require('./router.js');
let fs = require('fs');
let moment = require('moment');
const e = require('express');

let controller = {}


//退出回登录页面
controller.quit = (req,res)=>{
    req.session.destroy(function(err){
        if(err){throw err;}
        res.redirect('/');
    })
}
//获取图像和名字
controller.getSeeion = (req,res)=>{
    res.json({
        nickname:req.session.nickname,
        photo:req.session.photo
    })
   
}
//主页
controller.index = (req,res)=>{
    let sql1 = 'select count(*) as postsCount from posts';
    let sql2 = "select count(*) as draftedCount from posts where status = 'drafted'";
    let sql3 = 'select count(*) as cateCount from category';
    var sql4 = "select count(*) as commentCount  from comments ";
    var sql5 = "select count(*) as heldCount  from comments where status = 'held' ";

    let promiseArr = [query(sql1),query(sql2),query(sql3),query(sql4),query(sql5),];
    Promise.all(promiseArr).then(data=>{
        let resData = {};
        data.map((v)=>{
            Object.assign(resData,v[0]);
        })
        res.render('index.html',resData);
    })
   
    
}
//登录页面
controller.login = (req,res)=>{
    res.render('login.html');
}

//验证邮箱和密码
controller.provieng = (req,res)=>{
    let email = req.params.email;
    let password = req.params.password;
    let sql = `select * from users where email = '${email}' and password = '${password}' `
    query(sql).then((data)=>{
        if(data[0] === undefined){
            var responseData = {'code':-1,'message':'登录失败'};
            res.json(responseData);
        }else{
            req.session.user_id = data[0].user_id;
            req.session.email = data[0].email;
            req.session.nickname = data[0].nickname;
            req.session.intro = data[0].intro;
            req.session.photo = data[0].photo;
            var responseData = {'code':200,'message':'登录成功'};
            res.json(responseData);  
        }
    })
        
    
}

//文章页面
controller.posts = async(req,res)=>{
    let status = [
        {"key":"published","text":"发布"},
        {"key":"drafted","text":"草稿"},
        {"key":"trashed","text":"废弃"}
    ]
    let sql2 = "select * from category";
    var catData = await query(sql2);
    res.render('posts.html',{
        catData,
        status
    });
}

//获取总页数
let pageSize = 10;
controller.pageCount = (req,res)=>{
    let{cat_id,status} = req.query;
    var where = `1=1`;
    if(cat_id){
        where +=` and cat_id=${cat_id}`
    }
    if(status){
        where +=` and status='${status}'`
    }
    let sql = `select count(*) as postsCount from posts where ${where} `;
    query(sql).then(data=>{
        let totalPage = Math.ceil(data[0].postsCount /pageSize);
        res.json({totalPage});
    })
}

//获取当前页数的内容
controller.getPageData = (req,res)=>{
    let{cat_id,status} = req.query;
    var where = `1=1`;
    if(cat_id){
        where +=` and t1.cat_id=${cat_id}`
    }
    if(status){
        where +=` and t1.status='${status}'`
    }
    let page = parseInt(req.query.page);
    let offset = (page - 1)*pageSize;
    var sql = `
        SELECT  t1.*, t2.nickname, t3.cat_name
        FROM posts t1
        LEFT JOIN users t2 ON t1.user_id = t2.user_id
        LEFT JOIN category t3 ON t1.cat_id = t3.cat_id 
        where ${where}
        order by t1.post_id desc
        LIMIT ${offset},${pageSize}
        `;
    query(sql).then(data=>{
        res.json(data);
    })
    
}

//删除单条文章
controller.delPost = (req,res)=>{
    let post_id = req.params.post_id;
    let sql = 'delete from posts where post_id = '+ post_id;
    query(sql).then(rusule =>{
        let {affectedRows} = rusule;
        if(affectedRows){
            res.json({code:200,message:'删除成功'});
        }else{
            res.json({rode:-1,message:'删除失败'});
        }
    })
}

//回显数据到修改页面
controller.revisePost = async(req,res)=>{
    let post_id = req.params.post_id;
    let sql1 = 'select * from posts where post_id = '+ post_id;
    let status = [
        {"key":"published","text":"发布"},
        {"key":"drafted","text":"草稿"},
        {"key":"trashed","text":"废弃"}
    ]
    let sql2 = "select * from category";
    var catData = await query(sql2);
    var data = await query(sql1);
    data[0].photo == undefined ?data[0].photo :data[0].photo=data[0].photo.replace('./','/');
    data[0].created = moment(data[0].created).format('YYYY-MM-DD HH:mm:ss');
    res.render('post-revise.html',{
        data:data[0],
        catData:catData,
        status:status
    })
    
    
}

//修改数据
controller.updPost = (req,res)=>{
    let {post_id,title,content,category,created,status,feature} = req.body;
    user_id = req.session.user_id;
    let sql = `update posts set title='${title}', 
    content='${content}', 
    cat_id='${category}',
    created='${created}',
    status='${status}',
    feature='${feature}' 
    where post_id = ${post_id}`;
    query(sql).then(rusule=>{
        let {affectedRows} = rusule;
        if(affectedRows){
            res.json({code:200,message:'修改成功'});
        }else{
            res.json({code:-1,message:'修改失败'});
        }
    })
    
}

//写文章界面
controller.postAdd = (req,res)=>{
    let status = [
        {"key":"published","text":"发布"},
        {"key":"drafted","text":"草稿"},
        {"key":"trashed","text":"废弃"}
    ]
    let sql = "select * from category";
    query(sql).then(data=>{
        res.render('post-add.html',{
            catData:data,
            status:status
        })
    }) 
    
}

//添加文章
controller.savePost = (req,res)=>{
    let {title,content,category,created,status,feature} = req.body;
    user_id = req.session.user_id;
    let sql = `insert into posts(title,content,cat_id,created,status,feature,user_id) 
    values('${title}','${content}',${category},'${created}','${status}','${feature}','${user_id}')`;
    query(sql).then(rusule=>{
        let{affectedRows} = rusule;
        if(affectedRows){
            res.json({code:200,message:'添加成功'})
        }else{
            res.json({code:-1,message:'添加失败'});
        }
    })
}

//回显图片
controller.uploadFeature = (req,res)=>{
    if(req.file){
        let {filename,originalname,destination} = req.file;
        var ext = originalname.substring( originalname.indexOf('.') );
        let oldPath = `${destination}${filename}`;
        let newPath = `${destination}${filename}${ext}`;
        let fullPath = '';
        fs.rename(oldPath,newPath,function(err){
            if(err) throw err.message;
            res.json({fullPath:newPath})
        })
    }
}

//分类目录界面
controller.categories = async(req,res)=>{
    let sql = "select * from category";
    var data = await query(sql);
    res.render('categories.html',{
        catData:data,
    })
    
}
//添加目录
controller.addCat = async(req,res)=>{
    let{cat_name,classname} = req.body;
    let sql = `insert into category (cat_name,classname) values('${cat_name}','${classname}')`
    var rusule = await query(sql);
    let{affectedRows} = rusule;
    if(affectedRows){
        res.json({code:200,message:'添加成功',cat_id:rusule.insertId});
    }else{
        res.json({code:-1,message:'添加失败'});
    }
}
//删除目录
controller.delCat = async(req,res)=>{
    let cat_id = req.body.cat_id;
    let sql = 'delete from category where cat_id = '+cat_id;
    var rusule = await query(sql);
    let {affectedRows} = rusule;
    if(affectedRows){
        res.json({code:200,message:'删除成功'});
    }else{
        res.json({code:-1,message:'删除失败'});
    }
}

//评论页面
controller.comments = (req,res)=>{
    res.render('comments.html')
}
//查询所有评论条数
controller.getCommentsCount = async(req,res)=>{
    var sql ='select count(*) as commentsCount from comments';
    var data = await query(sql);
    let totalPage = Math.ceil(data[0].commentsCount / pageSize);
    res.json({totalPage}) 
}
//获取当前页面数据
controller.getCommentsData = async(req,res)=>{
    var page = req.body.page;
    var offset = (page-1)*pageSize;
    var sql = `
        SELECT  t1.* ,t2.title, t3.nickname
        FROM comments t1
        LEFT JOIN posts t2 ON t1.post_id = t2.post_id
        LEFT JOIN users t3 ON t3.user_id = t2.user_id 
        order by t1.comment_id desc
        LIMIT ${offset},${pageSize}
        `;
    var data = await query(sql);
    res.json(data);
}
//删除评论
controller.delComment = async(req,res)=>{
    var comment_id = req.body.comment_id;
    var sql = `delete from comments where comment_id = ${comment_id}`;
    var rusule = await query(sql);
    let {affectedRows} = rusule;
    if(affectedRows){
        res.json({code:200,message:'删除成功'});
    }else{
        res.json({code:-1,message:'删除失败'});
    }
}


//用户页面
controller.users = async(req,res)=>{
    var sql = 'select * from users';
    var data = await query(sql);
    data.map((v)=>{
        v.photo == undefined ?v.photo :v.photo=v.photo.replace('./','/');
        v.status == 'activated'?v.status ='激活':v.status ='未激活';
    })
    res.render('users.html',{
        userData:data
    });
}
//添加用户
controller.addUser = async(req,res)=>{
    let{email,nickname,password} = req.body;
    let sql = `insert into users (email,nickname,password,status) values('${email}','${nickname}','${password}','activated')`;
    var rusule = await query(sql);
    let{affectedRows} = rusule;
    if(affectedRows){
        res.json({code:200,message:'添加用户成功',user_id:rusule.insertId});
    }else{
        res.json({code:-1,message:'添加失败'});
    }
}
//删除用户
controller.delUser = async(req,res)=>{
    var user_id = req.body.user_id;
    var sql = `delete from users where user_id = ${user_id}`;
    var rusule = await query(sql);
    let {affectedRows} = rusule;
    if(affectedRows){
        res.json({code:200,message:'删除成功'});
    }else{
        res.json({code:-1,message:'删除失败'});
    }
}

//编辑用户
controller.userSet = async(req,res)=>{
    var user_id = req.params.user_id;
    var sql = `select * from users where user_id = ${user_id}`;
    var data = await query(sql);
    data[0].photo == undefined ?data[0].photo :data[0].photo=data[0].photo.replace('./','/');
    if(data != undefined){
        res.render('userSet.html',{
            userData:data[0]
        })
    }
}


//导航菜单页面
controller.navMenus = (req,res)=>{
    res.render('nav-menus.html');
}

//图片轮播页面
controller.slides = (req,res)=>{
    res.render('slides.html');
}


//个人中心页面
controller.profile = (req,res)=>{
    var photo = '';
    req.session.photo == undefined ?photo :photo = req.session.photo.replace('./','/');
    res.render('profile.html',{
        email: req.session.email,
        nickname : req.session.nickname,
        intro : req.session.intro,
        photo : photo
        
    });
}
//修改个人信息
controller.setProfile = (req,res)=>{
    let{email,nickname,intro,avatar} = req.body;
    let sql = `update users set nickname = '${nickname}',photo='${avatar}',intro = '${intro}' where email = '${email}'`;
    query(sql).then(rusule=>{
        let {affectedRows} = rusule;
        if(affectedRows){
            req.session.nickname = nickname;
            req.session.intro = intro;
            avatar == undefined ?req.session.photo =avatar :req.session.photo = avatar.replace('./','/');
            res.json({code:200,message:'更新成功'})
        }else{
            res.json({code:-1,message:'更新失败'})
        }
    })
}

//修改密码页面
controller.passwordReset=(req,res)=>{
    res.render('password-reset.html');
    
}

controller.setPassword = (req,res)=>{
    let{old,password} = req.body;
    email=req.session.email;
    let sql = `select * from users where password = '${old}' and email = '${email}'`
    query(sql).then(data=>{
        if(data[0] == undefined){
            res.json({code:-1,message:'旧密码错误'})
        }else{
            let sql = `update users set password = '${password}' where email = '${email}'`;
            query(sql).then(rusule=>{
                let {affectedRows} = rusule;
                if(affectedRows){
                    res.json({code:200,message:'修改成功'})
                }
            })
        }
    })
}
module.exports = controller;