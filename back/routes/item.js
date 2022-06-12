const express = require('express');
const multer = require('multer'); // 파일업로드, formData처리
const path = require('path');
const fs = require('fs'); // 폴더처리
const router = express.Router();

const db = require('../models');
const { User, OrderDetail } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Item } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Order } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Op } = require("sequelize"); // 시퀄라이즈 연산자 사용

const { isLoggedIn, isProvider, isAdmin } = require('./middlewears'); // 로그인 검사 미들웨어
const { text } = require('express');

// 업로드 폴더 생성
try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

// 파일 업로드, 이름 변경 처리
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).substring(0,5);
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
// 제품등록
router.post('/regist', isProvider, upload.none(), async (req, res, next) => {
  try {
    let item;
    let userId;
    let scope = req.body.scope;
    if (req.body.scope !== 'PRIVATE' && req.body.scope !== 'GROUP' && req.body.scope !== 'PUBLIC'){
      scope = 'PRIVATE';
    }
    if (req.body.providerKey === undefined || req.body.providerKey === null || req.body.providerKey === ''){
      userId = req.user.id
    } else {
      const user = await User.findOne({
        where: { key: req.body.providerKey }
      });
      if(!user){
        return res.status(400).send('해당 판매자가 존재하지 않습니다.');
      }
      userId = user.id
    }
    if (req.body.imgSrc !== undefined) {
      item = await Item.create({
        codeName: String(req.body.codeName).toUpperCase().trim(),
        name: req.body.name,
        scope,
        packageName: req.body.packageName,
        unit: String(req.body.unit).toUpperCase().trim(),
        msrp: req.body.msrp,
        supplyPrice: req.body.supplyPrice,
        description: req.body.description,
        UserId: userId,
        imgSrc: req.body.imgSrc,
      })
    } else {
      item = await Item.create({
        codeName: String(req.body.codeName).toUpperCase().trim(),
        name: req.body.name,
        scope,
        packageName: req.body.packageName,
        unit: String(req.body.unit).toUpperCase().trim(),
        msrp: req.body.msrp,
        description: req.body.description,
        supplyPrice: req.body.supplyPrice,
        UserId: userId,
      })
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 제품 수정
router.post('/update', isLoggedIn, upload.none(), async (req, res, next) => {
  // data: { itemId: number, codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  try {
    let exItem = await Item.findOne({
      where: { id: req.body.itemId }
    });
    if (!exItem) {
      res.status(404).send('해당 제품을 찾을 수 없습니다.')
    }
    let scope = req.body.scope;
    if (req.body.scope !== 'PRIVATE' && req.body.scope !== 'GROUP' && req.body.scope !== 'PUBLIC'){
      scope = 'PRIVATE';
    }
    if (req.body.imgSrc !== undefined) {
      await Item.update({
        codeName: String(req.body.codeName).toUpperCase().trim(),
        name: req.body.name,
        scope,
        packageName: req.body.packageName,
        unit: String(req.body.unit).toUpperCase().trim(),
        msrp: req.body.msrp,
        supplyPrice: req.body.supplyPrice,
        description: req.body.description,
        imgSrc: req.body.imgSrc,
      },
      {
        where: { id: exItem.id },
      })
    } else {
      await Item.update({
        codeName: String(req.body.codeName).toUpperCase().trim(),
        name: req.body.name,
        packageName: req.body.packageName,
        unit: String(req.body.unit).toUpperCase().trim(),
        scope,
        msrp: req.body.msrp,
        description: req.body.description,
        supplyPrice: req.body.supplyPrice,
      }, {
        where: { id: req.body.itemId },
      });
    }
    res.status(200).json(req.body.itemId);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 사진 업로드 
router.post('/image', isLoggedIn, upload.array('image'), (req, res, next) => { // POST /post/images
  res.json(req.files[0].filename);
});


// 모든 제품 목록 불러오기
router.get('/all', isLoggedIn, async (req, res, next) => { // GET /posts
  try {
    const items = await Item.findAll({
      include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "company"],
      }]
    });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 내 제품 목록 불러오기 (판매자)
router.get('/my', isLoggedIn, async (req, res, next) => { // GET /posts
  try {
    const items = await Item.findAll({
      where: { UserId: req.user.id },
      include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "company"],
      }]
    });
    if (items) {
      res.status(200).json(items);
    } else {
      res.status(404).send('제품이 존재하지 않습니다.');
    }
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 특정 판매자 제품 불러오기
router.get('/list/:userKey', isLoggedIn, async (req, res, next) => { // GET /posts
  try {
    const user = await User.findOne({
      where: {key: req.params.userKey}
    })
    if (!user) {
      return res.status(404).send('회원이 존재하지 않습니다.');
    }
    const items = await Item.findAll({
      where: { UserId: user.id },
      include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "key", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "key", "company"],
      }]
    });
    if (items) {
      res.status(200).json(items);
    } else {
      res.status(404).send('제품이 존재하지 않습니다.');
    }
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 특정 구매자 제품목록 불러오기
router.get('/list-customer/:userId', isLoggedIn, async (req, res, next) => { // GET /posts
  try {
    const user = await User.findOne({
      where: {id: req.params.userId }
    });
    if (!user) {
      return res.status(404).send('유저가 존재하지 않습니다.');
    }
    const myProvider = await User.findOne({
      where: {id: user.ProviderId},
    });
    if (!myProvider) {
      return res.status(404).send('해당 구매자의 판매자가 등록되지 않았습니다.');
    }
    const items = await Item.findAll({  // 판매자의 그룹공개 상품
      where: { 
        [Op.and]: [
          { scope: 'GROUP' }, 
          { UserId: myProvider.id }
        ]
      }, include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "key", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "key", "company"],
      }]
    })
    const myItems = await user.getUserViewItems({ // 내가 볼 수 있는 특정 상품
      include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "key", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "key", "company"],
      }]
    });
    const itemList = [...new Set([...items, ...myItems])];

    res.status(200).json(itemList);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 내 제품 목록 불러오기 (구매자)
router.get('/customer', isLoggedIn, async (req, res, next) => { // GET /posts
  try {
    const user = await User.findOne({
      where: {id: req.user.id },
      include: [
        {
          model: User,
          as: "Providers",
          attributes: ["id", "key", "company", "name"],
        }
      ]
    });
    if (!user) {
      return res.status(404).send('유저가 존재하지 않습니다.');
    }
    const myProvider = await User.findOne({
      where: {id: user.ProviderId},
    });
    if (!myProvider) {
      return res.status(404).send('해당 구매자의 판매자가 등록되지 않았습니다.');
    }
    const items = await Item.findAll({  // 판매자의 그룹공개 상품
      where: { 
        [Op.and]: [
          { scope: 'GROUP' }, 
          { UserId: myProvider.id }
        ]
      }, include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "key", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "key", "company"],
      }]
    })

    const myItems = await user.getUserViewItems({ // 내가 볼 수 있는 특정 상품
      include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "key", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "key", "company"],
      }]
    });
    const itemList = [...new Set([...items, ...myItems])];

    res.status(200).json(itemList);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 카트에 담긴 제품 불러오기
router.get('/cart/:userId', isLoggedIn, async (req, res, next) => { 
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
    });
    if (!user) {
      res.status(404).send('유저가 존재하지 않습니다.');
    }
    const myItems = await user.getUserViewItems();
    const myItemIds = myItems?.map((v) => {
      return v.dataValues.id;
    });
    // console.log('myItems#!@#@!#@!', myItemIds);
    const myCart = await user.getCartItem(
      {
        where: {
          scope: {
            [Op.not]: 'GROUP' 
          },
        },
      }
    );
    // console.log('### myCart', myCart);
    const myCartIds = myCart?.map((v) => {
      return v.dataValues.id;
    });
    const shouldDeleteIds = myCartIds.filter(
      (v) => !myItemIds.includes(v)
    );
    
    // 삭제해야 하는것
    // 내 카트안에 든 아이템 중
    // scope = group이 아니고
    // 내가 볼 수 있는 아이템 목록에 없는 아이템.
    // (판매자가 내가 볼 수 있는 아이템 수정했을 경우.)

    await user.removeCartItem(shouldDeleteIds);
    const newCartList = await user.getCartItem();
    res.status(200).json(newCartList);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 카트에 제품 넣기
router.patch('/add-cart', isLoggedIn, async (req, res, next) => { 
  // req.body: { itemId: 10, userId: 'tester1' }
  try {
    const item = await Item.findOne({ // 제품 찾기
      where: {
        id: req.body.itemId,
      }
    });
    const user = await User.findOne({ // 아이디 찾기
      where: {
        id: req.body.userId,
      }
    });
    if (!item || !user) {
      return res.status(403).send('해당 제품이나 고객이 존재하지 않습니다.');
    }
    // const itemUsers = await item.addItemViewUsers(req.body.values.customerIds);
    const result = await item.addUser(user.id);
    // const result = await user.addItem(item.id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 카트에서 제품 빼기
router.patch('/remove-cart', isLoggedIn, async (req, res, next) => { 
  // req.body: { itemId: 10, userId: 'tester1' }
  try {
    const item = await Item.findOne({ // 제품 찾기
      where: {
        id: req.body.itemId,
      }
    });
    const user = await User.findOne({ // 아이디 찾기
      where: {
        id: req.body.userId,
      }
    });
    if (!item || !user) {
      return res.status(403).send('해당 제품이나 고객이 존재하지 않습니다.');
    }
    const result = await item.removeUser(req.body.userId);
    // const result = 'hi'
    // console.log('result', result);
    res.status(200).json(req.body.itemId);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 제품 삭제
router.patch('/delete', isLoggedIn, async (req, res, next) => { 
  try {
    const user = await User.findOne({
      where: { id: req.user.id }
    })
    if (!user) {
      return res.status(404).send('권한이 없습니다.');
    }
    const item = await Item.findOne({
      where: { id: req.body.itemId }
    })
    if ( item.UserId === req.user.id || user.role === 'ADMINISTRATOR') {
      await Item.destroy({
        where: { id: item.id }
      })
    } else {
      return res.status(404).send('권한이 없습니다.');
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주문목록 가져오기 (구매자용)
router.get('/orders/:userId', async (req, res, next) => { // GET /post/1
  try {
    let date1 = new Date();
    let date2 = new Date('2021-12-28')
    const order = await Order.findAll({
      where: {
        customerId: req.params.userId,
        date: { [Op.between]: [date2, date1] }
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "name", "phone"],
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


// 주문목록 가져오기 (판매자용)
router.get('/received-orders/:userId', async (req, res, next) => { // GET /post/1
  try {
    const order = await Order.findAll({
      where: { providerId: req.params.userId },
      order: [
        ['createdAt', 'DESC'],
      ],
      // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
      include: [{
        model: User,
        as: 'Provider',
        attributes: ["id", "company", "name", "phone"],
      }, {
        model: User,
        as: 'Customer',
        attributes: ["id", "company", "name", "phone"],
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

// 제품 조회
router.get('/:itemId', async (req, res, next) => { // GET /post/1
  try {
    const item = await Item.findOne({
      where: { id: req.params.itemId },
    });
    if (!item) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    const fullPost = await Item.findOne({
      where: { id: item.id },
      include: [{
        model: User,
        as: 'ItemViewUsers',
        attributes: ["id", "key", "company", "name"],
      }, {
        model: User,
        attributes: ["id", "key", "company"],
      }]
    })
    res.status(200).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 제품에 열람가능한 고객 등록
router.post('/add-customer', isLoggedIn, async (req, res, next) => {
  try {
    const item = await Item.findOne({
      where: { id: req.body.itemId}
    });
    if (!item) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    // 유저 아이디 있는지 검사
    if(req.body.values.customerIds){
      await Promise.all(
        req.body.values.customerIds.map( customerId => {
          const user = User.findOne({ 
            where: { id: customerId },
            attributes: ["id"],
          })
          if (!user){
            return res.status(404).send('해당 유저가 존재하지 않습니다.');
          }
        })
      );
    }
    const itemViewUsers = await item.getItemViewUsers();
    if (itemViewUsers) { // 기존 제품열람가능 유저 제거
      const deletedUsers = await item.removeItemViewUsers(itemViewUsers);
    }
    // 제품 열람가능한 유저 추가
    const itemUsers = await item.addItemViewUsers(req.body.values.customerIds);

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

module.exports = router;
