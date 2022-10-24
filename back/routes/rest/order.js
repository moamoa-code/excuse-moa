const express = require('express');
const router = express.Router();
const { orderService } = require('../../services');
const { Order } = require('../../models'); // 시퀄라이즈 - MySQL DB연결
const { User, OrderDetail } = require('../../models'); // 시퀄라이즈 - MySQL DB연결

const { Op } = require('sequelize'); // 시퀄라이즈 연산자 사용

const { isLoggedIn, isProvider, isAdmin, isMineOrAdminAccessible } = require('../middlewears'); // 로그인 검사 미들웨어
const { getOrderListCutomerSide } = require('../../services/orderService');

router.get('/', async (req, res, next) => {
  res.status(200).json('hi:1');
});

// 제품 주문
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const result = await orderService.orderItem(req.body);
    if (result?.error) {
      console.log('에러발생', result?.error);
      return res.status(401).send(result?.error);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 일정기간 주문목록 가져오기 (구매자용)
router.get('/customer/:userId', isMineOrAdminAccessible, async (req, res, next) => {
  try {
    const result = await getOrderListCutomerSide(
      req.params.userId,
      req.query.start,
      req.query.end,
    );
    if (result?.error) {
      console.log('에러발생', result?.error);
      return res.status(401).send(result?.error);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
