let mysql = require('mysql');

//连接mysql
let database = require('./config/database');
let connection = mysql.createConnection(database);

//测试mysql是否连接成功
connection.connect(function(err){
    if(err){err};
    console.log('mysql连接成功');
})


module.exports = function query(sql){
    return new Promise((resolve,reject)=>{
        connection.query(sql,(err,rows,feils)=>{
            if(err){throw err}
            resolve(rows);
        })
    })
}


