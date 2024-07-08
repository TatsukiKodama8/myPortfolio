/* ========== EXTERNAL FILES ========== */
let config = require('./config');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const mysql = require('mysql');
var app = express();

/* ========== CONSTANTS ========== */
const PORT = config.port;
const TABLE_NAME = 'users';


/* ========== SETTINGS ========== */
// 静的ファイルを提供するためのミドルウェアを設定
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());  // これを追加してJSON形式のデータも扱えるようにする

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// view engineをejsにセットする
app.set('view engine', 'ejs');


// TODO: hard codingになっているので書き換える => DONE
const db = mysql.createConnection({
    host: config.host,
    user: config.user,    // select User, Plugin from mysql.user;　プラグインがユーザごとに異なるので注意
    password: config.password,
    database: config.database
});

// MySQLへの接続の確認
db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
})


/* ========== FUNCTIONS ========== */

// emailとpasswordをDBへ格納する関数
//      .query(MySQLに出したい命令, 代入したいパラメタ配列, コールバック関数)
//      例）.query( '(?, ?)', [A, B], ... )とすると、
//      (?, ?) = (A, B)となるように配列の各要素が順に?に代入される 
/*
function insertUser(mailAddress, password, callback) {
    const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(insertQuery, [mailAddress, password], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return callback(err);
        }
        console.log('Data inserted:', result);
        callback(null, result);
    });
}
*/





/* =========== INDEX =========== */
app.get('/', function (req, res) {
    res.render('pages/index');
});

// /index ルートを追加
app.get('/index', (req, res) => {
    res.render('pages/index'); // ここで index.ejs をレンダリングする
});


/* =========== CONTACT =========== */
/*
app.get('/', function (req, res) {
    res.render('pages/index');
});
*/

/*
const isAuthorized = (mailAddress) => {
    let overlapCheckQuery = `SELECT * FROM ${TABLE_NAME} WHERE email = ?`;
    db.query(overlapCheckQuery, [mailAddress]);
}
*/



// contactページでポストされた情報が来て欲しい
app.post('/', async (req, res) => {

    // フォームからrequestされたメアドとパスワードを格納する
    let mailAddress = req.body.mailAddress;
    let password = req.body.password;

    // email passwordといったユーザ情報をMySQLから取り出す
    let overlapCheckQuery = `SELECT * FROM ${TABLE_NAME} WHERE email = ?`;
    db.query(overlapCheckQuery, [mailAddress, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // 取り出したユーザ情報
        let emaiInDb = result[0].email;
        let passwordInDb = result[0].password;
        
        console.log(mailAddress);
        console.log(emaiInDb);
        console.log(password);
        console.log(passwordInDb);

        // アドレスが一致していない => Unauthorized
        // アドレス一致
        //      -> パスワ一致してない => passwordが違いますと表示させて、同じページをresponse
        //      -> パスワードが一致 => index pageへ
        if ( emaiInDb !== mailAddress ) {
            return res.send("<h1>401 Unauthorized</h1>");
        } 
        if ( passwordInDb !== password) {
            return res.send("<h1>Password is wrong.</h1>");
        } else {
            console.log("Authorized");
            res.render('pages/portfolio');    // TODO: Index pageに送ることができない！
        }

        
        // Passwordが違う

        /*
         * NOTE(2024/07/08): もし認証ユーザ以外を弾くならば、今の所、新規ユーザをDBへ格納する必要はない
         */
        
        // emailとpasswordをDBへ格納する関数
        /*
        insertUser(mailAddress, password, (err, result) => {
            if (err) {
                return res.status(500).send("Error inserting data into database");
            }
            res.render('pages/contact');             
        });
        */
        

    })
    //res.render('pages/contact');
})

/* ========== LISTEN ========== */
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}.`);
});






