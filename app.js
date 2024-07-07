/* ========== EXTERNAL FILES ========== */
let config = require('./config');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const mysql = require('mysql');
var app = express();

/* ========== CONSTANTS ========== */
const PORT = 3000;
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





/* =========== INDEX =========== */
app.get('/', function (req, res) {
    res.render('pages/index');
});


/* =========== CONTACT =========== */
app.get('/contact', function (req, res) {
    res.render('pages/contact');
});

// contactページでポストされた情報が来て欲しい
app.post('/contact', (req, res) => {
    console.log(req.body);
    let mailAddress = req.body.mailAddress;
    let password = req.body.password;
    console.log(mailAddress, password);
    // postされたemailとDBのemailの重複チェック
    let overlapCheckQuery = `SELECT * FROM ${TABLE_NAME} WHERE email = ?`;
    db.query(overlapCheckQuery, [mailAddress], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length > 0) {
            console.log("The user has already registered.")
            return;
        }

        // emailとpasswordをDBへ格納する関数
        insertUser(mailAddress, password, (err, result) => {
            if (err) {
                return res.status(500).send("Error inserting data into database");
            }
            res.render('pages/contact');             
        });

    })

    //res.render('pages/contact');
})

/* ========== LISTEN ========== */
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}.`);
});






