let express = require('express');
let path = require('path');
let artTemplate = require('art-template')
let expressTemplate = require('express-art-template')
let cookieParse = require('cookie-parser');
let expres_session = require('express-session');
let cors = require('cors');

let router = require('./router.js');
let apiRouter = require('./apiRouter.js');



let app = express();

app.use(expres_session({
  name:'SESSIONID',  // session会话名称在cookie中的值
  secret:'%#%￥#……%￥', // 必填项，用户session会话加密（防止用户篡改cookie）
  cookie:{  //设置session在cookie中的其他选项配置
    path:'/',
    secure:false,  //默认为false, true 只针对于域名https协议
    maxAge:60000*24,  //设置有效期为24分钟，说明：24分钟内，不访问就会过期，如果24分钟内访问了。则有效期重新初始化为24分钟。
  }
}))

// 使用内置中间件，接收post参数
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//托管静态资源
app.use('/public',express.static(__dirname+'/public/'))

//允许跨域
app.use(cors());

//使用api路由中间件，挂载路由
//app.use('/api',apiRouter);


// 配置模板引擎为art-template
// 配置模板的路径
app.set('views', __dirname + '/views/');
// 设置express_template模板后缀为.html的文件
app.engine('html', expressTemplate); 
// 设置视图引擎为上面的html
app.set('view engine', 'html');




//安装cookie获取中间件
app.use(cookieParse());


// //使用中间件判断用户是否登录过
// app.use(function(req,res,next){
//     var path = req.path.toLowerCase();
//     var notCheck = ['/login','/'];
//     if(!notCheck.includes(path)){
//         if(req.session.uid){
//             next();
//         }else{
//             res.redirect('/');
//         }
//     }else{
//         next();
//     }
// })


app.use(router);
    



app.listen(4000,_=>{
    console.log('服务开始,端口号4000');
})