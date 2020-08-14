let express = require('express');
let controller = require('./controller.js');
let router = express.Router();

let multer = require('multer');

let upload = multer({
    dest:"./public/uploads/"
})
//首页
router.get('/index',controller.index);
//获取图像和名字
router.get('/getSeeion',controller.getSeeion);

//退出
router.get('/quit',controller.quit);

//登录页面
router.get('/',controller.login);
router.post('/login/:email/:password',controller.provieng);

//所有文章
router.get('/posts',controller.posts);

//获取所有页数
router.get('/pageCount',controller.pageCount);
//获取当前页数的内容
router.get('/getPageData',controller.getPageData);

//删除数据
router.post('/delPost/:post_id',controller.delPost);
//回显数据到修改页面
router.get('/revisePost/:post_id',controller.revisePost);
//修改数据
router.post('/updPost',controller.updPost);

//写文章
router.get('/post-add',controller.postAdd);
router.post('/savePost',controller.savePost);
router.post('/uploadFeature',upload.single('feature'),controller.uploadFeature);

//分类目录
router.get('/categories',controller.categories);
//添加目录
router.post('/addCat',controller.addCat);
//删除目录
router.post('/delCat',controller.delCat);


//评论
router.get('/comments',controller.comments);
//获取所有条数评论
router.get('/getCommentsCount',controller.getCommentsCount);
//获取页面数据
router.post('/getCommentsData',controller.getCommentsData);
//删除评论
router.post('/delComment',controller.delComment);

//用户
router.get('/users',controller.users);
//添加用户
router.post('/addUser',controller.addUser);
//删除用户
router.post('/delUser',controller.delUser);
//编辑用户
router.get('/userSet/:user_id',controller.userSet);

//导航菜单
router.get('/nav-menus',controller.navMenus);

//图片轮播
router.get('/slides',controller.slides);

//个人中心
router.get('/profile',controller.profile);
router.post('/setProfile',controller.setProfile);

//修改密码
router.get('/password-reset',controller.passwordReset);
router.post('/setPassword',controller.setPassword);




module.exports = router;