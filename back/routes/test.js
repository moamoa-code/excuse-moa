const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Operator. 연산자
const bcrypt = require('bcrypt'); // 비밀번호 암호화 라이브러리
// const passport = require('passport');
const { User, Item, Address } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { isLoggedIn, isProvider, isNotLoggedIn, isAdmin } = require('./middlewears'); // 로그인 검사 미들웨어
const e = require('express');

// 판매자 목록 불러오기
router.get('/cookie', async (req, res, next) => { // 
  try {
    console.log('요청받음')
    const test1 = req.cookies;
    console.log(test1)

    res.status(200).json(test1)
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
