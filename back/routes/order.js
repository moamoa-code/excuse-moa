const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

const { User, OrderDetail } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Item } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Order } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Op } = require("sequelize"); // 시퀄라이즈 연산자 사용

const { isLoggedIn, isProvider, isAdmin } = require('./middlewears'); // 로그인 검사 미들웨어
const { text } = require('express');


// 카트에서 제품 주문
router.post('/', isLoggedIn, async (req, res, next) => { 
  try {
    const orderDataMap = new Map(Object.entries(req.body.items));
    const itemIds = Object.keys(req.body.items);
    const items = await Item.findAll({  // 해당되는 제품들 찾기
      where: {
        id: {
          [Op.or]: itemIds
        }
      }
    });
    const provider = await User.findOne({ // 판매자 찾기
      where: {
        id: items[0].UserId
      }
    })
    const order = await Order.create({ // 주문 INSERT
      comment: req.body.comment,
      address: req.body.address,
      zip: req.body.zip,
      name: req.body.name,
      phone: req.body.phone,
      ProviderId: provider.id,
      CustomerId: req.user.id,
    })

    const orderDetailItems = items.map((item) => { // 주문상세 데이터 작성
      const tag = orderDataMap.get(String(item.id)).tag;
      const qty = orderDataMap.get(String(item.id)).qty;
      return {
        tag: tag,
        qty: qty,
        OriginItemId: item.id,
        itemCodeName: item.codeName,
        itemPackage: item.packageName,
        itemName: item.name,
        itemUnit: item.unit,
        itemMsrp: item.msrp,
        itemSupplyPrice: item.supplyPrice,
        OrderId: order.id,
      }
    });
    const orderDetail = await OrderDetail.bulkCreate(orderDetailItems); 

    let totalPrice = 0;
    orderDetail.map((item) => {
      let price = Number(item.itemSupplyPrice)?? 0;
      if(isNaN(item.itemSupplyPrice)) {
        price = 0;
      }
      return totalPrice = totalPrice + (price * Number(item.qty));
    });

    order.update({
      totalPrice: String(totalPrice),
    });
    
    res.status(200).json(order.id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 공장에서 제품 주문
router.post('/from-factory', isLoggedIn, async (req, res, next) => { 
  try {
    const itemsArray = req.body.items;
    let itemIds = [];
    let tempItems = [];
    itemsArray.map((v) => {
      if(String(v.id).includes('F_')) {
        tempItems.push(v);
      } else {
        itemIds.push(v.id);
      }
    });

    let items = []
    if (itemIds.length >= 1) {
      items = await Item.findAll({  // 해당되는 제품들 찾기
        where: {
          id: {
            [Op.or]: itemIds
          }
        }
      });
    }

    const provider = await User.findOne({ // 판매자 찾기
      where: {
        id: req.body.providerId
      }
    });
    const customer = await User.findOne({ // 판매자 찾기
      where: {
        id: req.body.customerId
      }
    });
    let name = req.body.name;
    if (req.body.name === '') {
      name = customer?.company;
    }
    let comment = req.body.comment;
    if (comment === null || comment === undefined || comment.length === 0) {
      comment = 'POS입력'
    }
    const tWeight = req.body.totalWeight + 'kg'
    const order = await Order.create({ // 주문 INSERT
      comment: comment,
      address: req.body.address,
      zip: '',
      name: name,
      phone: req.body.phone,
      ProviderId: provider.id,
      CustomerId: req.body.customerId,
      totalWeight: tWeight
    })

    let orderDetail = [];
    if (items.length >= 1) {
      const orderDetailItems = items?.map((item) => { // 주문상세 데이터 작성
        const originalItem = itemsArray.find((v)=>(v.id === item.id));
        const tag = originalItem.tag;
        const qty = originalItem.qty;
        return {
          tag: tag,
          qty: qty,
          OriginItemId: item.id,
          itemCodeName: item.codeName,
          itemPackage: item.packageName,
          itemName: item.name,
          itemUnit: item.unit,
          itemMsrp: item.msrp,
          itemSupplyPrice: item.supplyPrice,
          OrderId: order.id,
        }
      });
      orderDetail = await OrderDetail.bulkCreate(orderDetailItems); 
    }

    if (tempItems.length >= 1) {
      const orderDetailTempItems = tempItems.map((item) => { // 주문상세 데이터 작성
        const tag = item.tag;
        const qty = item.qty;
        return {
          tag: tag,
          qty: qty,
          itemCodeName: item.codeName,
          itemPackage: item.packageName,
          itemName: item.name,
          itemUnit: item.unit,
          OrderId: order.id,
        }
      });
      await OrderDetail.bulkCreate(orderDetailTempItems);
    }

    let totalPrice = 0;
    orderDetail?.map((item) => {
      let price = Number(item.itemSupplyPrice)?? 0;
      if(isNaN(item.itemSupplyPrice) || item.itemSupplyPrice === null || item.itemSupplyPrice === undefined) {
        price = 0;
      }
      return totalPrice = totalPrice + (price * Number(item.qty));
    });

    order.update({
      totalPrice: String(totalPrice),
    });
    
    res.status(200).json(order.id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 일정기간 주문목록 가져오기 (구매자용)
router.get('/:userId/:from/:til', async (req, res, next) => {
  try {
    let from = new Date(req.params.from);
    from.setHours('0');
    let til = new Date(req.params.til);
    til.setHours('23');
    til.setMinutes('59');
    til.setSeconds('59');

    const order = await Order.findAll({
      where: {
        customerId: req.params.userId,
        date: { [Op.between]: [from, til] }
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    });
    if (!order) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주문취소 요청 (구매자)
router.patch('/req-cancel', isLoggedIn, async (req, res, next) => { 
  // req.body: {orderId: number, message: string}
  try {
    const order = await Order.findOne({ // 주문 찾기
      where: {
        id: req.body.orderId,
      }
    });
    if(order.CustomerId !== req.user.id){
      return res.status(400).send('본인만 요청 가능합니다.');
    }
    order.update({
      message: req.body.message,
      status: '주문취소요청중'
    })
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 주문확인 완료 (판매자)
router.patch('/confirm', isProvider, async (req, res, next) => { 
  // req.body: {orderId: number, message: string}
  try {
    const me = await User.findOne({
      where: {
        id: req.user.id
      }
    })
    const order = await Order.findOne({ // 주문 찾기
      where: {
        id: req.body.orderId,
      }
    });
    if(order.ProviderId !== me.id) {
      if (me.role !== 'ADMINISTRATOR') {
        return res.status(400).send('판매자만 확인 가능합니다.');
      }
    }
    order.update({
      message: req.body.message,
      status: '주문확인완료',
      isCanceled: false
    })
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주문취소 완료 (판매자)
router.patch('/cancel', isProvider, async (req, res, next) => { 
  // req.body: {orderId: number, message: string}
  try {
    const order = await Order.findOne({ // 주문 찾기
      where: {
        id: req.body.orderId,
      }
    });
    const user = await User.findOne({
      where: {
        id: req.user.id,
      }
    })
    if(order.ProviderId !== req.user.id && user.role !==  'ADMINISTRATOR'){
      return res.status(400).send('판매자만 취소 가능합니다.');
    }
    order.update({
      message: req.body.message,
      status: '주문취소완료',
      isCanceled: true
    })
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 포장 완료 (생산자)
router.patch('/pack-complete', isAdmin, async (req, res, next) => { 
  try {
    const orderDetail = await OrderDetail.findOne({ // 주문 찾기
      where: {
        id: req.body.id
      }
    });
    orderDetail.update({
      status: '포장완료',
    })
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 포장 완료 취소 (생산자)
router.patch('/pack-cancel', isAdmin, async (req, res, next) => { 
  try {
    const orderDetail = await OrderDetail.findOne({ // 주문 찾기
      where: {
        id: req.body.id
      }
    });
    orderDetail.update({
      status: '작업중',
    })
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 출하 완료 (판매자)
router.patch('/task-complete', isAdmin, async (req, res, next) => { 
  // req.body: {orderId: number, message: string}
  try {
    const orders = await Order.findAll({
      where: { id: req.body.ids },
      attributes: ["id", "status", "factoryStatus"],
      include: [{
        model: OrderDetail,
        attributes: ["id", "status"],
      }]
    })
    const unDoneOrderIds = orders.map((v) => { 
      const od = v.OrderDetails;
      if ((od.find((i) => i.status === '작업중' || i.status === '보류' || i.status === '취소'))){
        return v?.id
      }
    })
    const doneOrderIds = req.body.ids.filter((v) => !unDoneOrderIds.includes(v));
    // const doneOrders = await Order.findAll({
    //   where: { id: doneOrderIds }
    // })
    Order.update({
      factoryStatus: '출하'
    },{
      where: { id: doneOrderIds }
    });

    res.status(200).json(doneOrderIds);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 일정기간 모든 주문목록 가져오기 (관리자용)
router.post('/all-orders', isAdmin, async (req, res, next) => { 
  try {
    let from = new Date(req.body.from);
    from.setHours('0');
    let til = new Date(req.body.til);
    til.setHours('23');
    til.setMinutes('59');
    til.setSeconds('59');

    const order = await Order.findAll({
      where: {
        date: { [Op.between]: [from, til] },
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    }); 

    if (!order) {
      return res.status(403).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 일정기간 주문목록 가져오기 (판매자용)
router.get('/received-orders-dates/:userId/:from/:til', isProvider, async (req, res, next) => { 
  try {
    let from = new Date(req.params.from);
    from.setHours('0');
    let til = new Date(req.params.til);
    til.setHours('23');
    til.setMinutes('59');
    til.setSeconds('59');

    const user = await User.findOne({
      where: { id: req.params.userId }
    })
    if (!user) {
      return res.status(403)('해당 유저가 존재하지 않습니다.');
    }
    const me = await User.findOne({
      where: { id: req.user.id }
    })
    if (me.role !== 'ADMINISTRATOR'){
      if (me.id !== user.id) {
        return res.status(403)('권한이 없습니다.');
      }
    }

    const order = await Order.findAll({
      where: {
        providerId: req.params.userId,
        date: { [Op.between]: [from, til] }
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    }); 

    if (!order) {
      return res.status(403).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});




// 모든 주문목록 가져오기 (공장)
router.get('/all', isProvider, async (req, res, next) => { 
  try {
    const order = await Order.findAll({
      order: [
        ['createdAt', 'DESC'],
      ],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: OrderDetail
      }]
    });
    if (!order) {
      return res.status(403).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주문목록 가져오기 (공장)
router.post('/todos', async (req, res, next) => {
  try {
    let from = new Date(req.body.from);
    from.setHours('0');
    let til = new Date(req.body.til);
    til.setHours('23');
    til.setMinutes('59');
    til.setSeconds('59');
    const stat1 = req.body.stat1? req.body.stat1 : '';
    const stat2 = req.body.stat2? req.body.stat2 : '';
    const stat3 = req.body.stat3? req.body.stat3 : '';
    const order = await Order.findAll({
      where: {
        date: { [Op.between]: [from, til] },
        status: stat1,
        factoryStatus: stat2,
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: OrderDetail,
        where: { status: stat3 }
      }]
    });
    // console.log(order);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주문목록 가져오기 (판매자용)
router.get('/received-orders/:userId', isProvider, async (req, res, next) => { 
  try {
    const user = await User.findOne({
      where: { id: req.params.userId }
    })
    if (!user) {
      return res.status(403)('해당 유저가 존재하지 않습니다.');
    }
    const me = await User.findOne({
      where: { id: req.user.id }
    })
    const order = await Order.findAll({
      where: { providerId: req.params.userId },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    });
    if (!order) {
      return res.status(403).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주문목록 3개 가져오기 (판매자용)
router.get('/recent-received-orders/:userKey', isProvider, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { key: req.params.userKey }
    })
    if (!user) {
      return res.status(403).send('해당 유저가 존재하지 않습니다.');
    }
    const order = await Order.findAll({
      where: { ProviderId: user.id },
      limit:3,
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    });
    if (!order) {
      return res.status(403).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 주문목록 가져오기 (판매자용)
router.get('/received-orders/:userId', isProvider, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId }
    })
    if (!user) {
      return res.status(403).send('해당 유저가 존재하지 않습니다.');
    }
    const me = await User.findOne({
      where: { id: req.user.id }
    })
    if ( user.id !== me.id || me.role !== 'ADMINISTRATOR')  {
      return res.status(403).send('열람권한이 없습니다.');
    }
    const order = await Order.findAll({
      where: { providerId: req.params.userId },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    });
    if (!order) {
      return res.status(403).send('해당 제품이 존재하지 않습니다.');
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 주문서 조회
router.get('/:orderId', isLoggedIn, async (req, res, next) => { // GET /post/1
  try {
    const order = await Order.findOne({
      where: { id: req.params.orderId },
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "key", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "key", "name", "phone"],
      }]
    });
    if (!order) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    const orderDetails = await OrderDetail.findAll({
      where: { OrderId: order.id },
    })
    const data = {order, orderDetails};
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
