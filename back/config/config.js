const dotenv = require('dotenv'); // 비밀번호 .env 파일에 따로 관리
dotenv.config();

// 타임존 +9 (서울)로 추가함
module.exports = { // dotenv
  "development": {
    "username": "root",
    "password": process.env.DB_PASSWORD,
    "database": "excuse-moa",
    "host": "127.0.0.1",
    "port": "3306",
    "dialect": "mysql",
    "timezone": "+09:00"
  },
  "test": {
    "username": "root",
    "password": process.env.DB_PASSWORD,
    "database": "excuse-moa",
    "host": "127.0.0.1",
    "port": "3306",
    "dialect": "mysql",
    "timezone": "+09:00"
  },
  "production": {
    "username": "root",
    "password": process.env.DB_PASSWORD,
    "database": "excuse-moa",
    "host": "127.0.0.1",
    "port": "3306",
    "dialect": "mysql",
    "timezone": "+09:00"
  }
}
