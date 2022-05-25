const express = require('express');
const multer = require('multer'); // 파일업로드, formData처리
const path = require('path');
const fs = require('fs'); // 폴더처리
const router = express.Router();

const db = require('../models');
const { User, OrderDetail, Inventory, Stock, InventoryGroup, InventoryDetail } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Item } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Order } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Op } = require("sequelize"); // 시퀄라이즈 연산자 사용

const { isLoggedIn, isProvider, isAdmin } = require('./middlewears'); // 로그인 검사 미들웨어
const { text } = require('express');

// 보고서 그룹 생성
router.post('/create-group', isLoggedIn, async (req, res, next) => {
  try {
    if(!req.body.name) {
      return res.status(403).send('보고서명을 입력하세요.');
    }
    const inventoryGroup = await InventoryGroup.create({
      name: req.body.name,
      desc: req.body.desc,
      UserId: req.user.id,
    })
    res.status(200).json(inventoryGroup);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 재고품목 등록
router.post('/create-stock', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.body.userId
      }
    })
    if(!user){
      return res.status(403).send('유저를 찾을수 없습니다.');
    }
    if(!req.body.type) {
      return res.status(403).send('타입을 입력하세요.');
    }
    if(!req.body.name) {
      return res.status(403).send('보고서명을 입력하세요.');
    }
    const stock = await Stock.create({
      type: req.body.type,
      name: req.body.name,
      desc: req.body.desc,
      UserId: user.id,
    })
    res.status(200).json(stock);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 재고품목 제거처리
router.patch('/delete-stock', isLoggedIn, async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const stock = await Stock.findOne({
      where: {
        id: req.body.id
      }
    })
    if(!stock){
      return res.status(403).send('해당 재고품을 찾을 수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== stock.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }

    await Stock.update({
      isDeleted: true,
    },{
      where: { id: stock.id },
    });
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 재고보고서 삭제
router.patch('/delete', isLoggedIn, async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const inventory = await Inventory.findOne({
      where: {
        id: req.body.id
      }
    })
    if(!inventory){
      return res.status(403).send('해당 재고 보고서를 찾을 수 없습니다.');
    }
    const group = await InventoryGroup.findOne({
      where: {
        id: inventory.InventoryGroupId
      }
    })
    if(!group){
      return res.status(403).send('해당 재고 보고서그룹을 찾을 수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== group.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }
    await Inventory.destroy({
      where: { id: inventory.id }
    })
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 재고보고서 그룹 삭제처리
router.patch('/delete-group', isLoggedIn, async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const inventoryGroup = await InventoryGroup.findOne({
      where: {
        id: req.body.id
      }
    })
    if(!inventoryGroup){
      return res.status(403).send('해당 그룹을 찾을 수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== inventoryGroup.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }
    await inventoryGroup.update({
      isDeleted: true,
    },{
      where: { id: inventoryGroup.id },
    });
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 재고보고서 확인 (메모, 상태 업데이트)
router.patch('/confirm', isLoggedIn, async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const inventory = await Inventory.findOne({
      where: {
        id: req.body.id
      }
    })
    if(!inventory){
      return res.status(403).send('해당 재고 보고서를 찾을 수 없습니다.');
    }
    const group = await InventoryGroup.findOne({
      where: {
        id: inventory.InventoryGroupId
      }
    })
    if(!group){
      return res.status(403).send('해당 재고 보고서그룹을 찾을 수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== group.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }

    let datas;
    if(!req.body?.datas) {
      return res.status(403).send('데이터가 없습니다.');
    }
    datas = req.body?.datas;
    let details = await InventoryDetail.findAll({
      where: {
        InventoryId: inventory.id
      },
      raw: true, // 일반적인 배열 형태로 나옴
    })
    if(!details){
      return res.status(403).send('빈 보고서입니다.');
    }
    details.forEach((v) => {
      const data = datas.find((x) => Number(x.id) === Number(v.id))
      v.status = data.status
    });

    Array.from(details).forEach((v) => {
      InventoryDetail.update( { status: v.status }, { where: { id: v.id } })
    });

    // await InventoryDetail.bulkCreate(
    //   details, 
    //   {pdateOnDuplicate: ["id"]},
    // )

    if (req.body.memo === '' || req.body.memo === undefined || req.body.memo === null) {
      await inventory.update({
        status: '확인완료',
      },{
        where: { id: inventory.id },
      });
    } else {
      await inventory.update({
        status: '확인완료',
        memo: req.body.memo,
      },{
        where: { id: inventory.id },
      });
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 재고보고서 그룹 목록 가져오기
router.get('/group-list/:userId', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      }
    });
    if(!user) {
      return res.status(403).send('유저를 찾을수 없습니다.');
    }
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== user.id) {
      return res.status(403).send('권한이 없습니다.');
    }
    const groups = await InventoryGroup.findAll({
      where: {
        UserId: user.id,
        isDeleted: false,
      },
    })
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 재고보고서 그룹 가져오기
router.get('/group/:groupId', async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const group = await InventoryGroup.findOne({
      where: {
        id: req.params.groupId,
      }
    });
    if(!group) {
      return res.status(403).send('재고 보고서 그룹을 찾을수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== group.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 특정 인벤토리 그룹의 인벤토리 목록 가져오기
router.get('/list/:groupId/:page', async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const group = await InventoryGroup.findOne({
      where: {
        id: req.params.groupId,
      }
    });
    if(!group) {
      return res.status(403).send('재고 보고서 그룹을 찾을수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== group.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }
    // 페이지네이션 (페이징 처리)
    let limit = 10;
    let offset = 0 + (req.params.page - 1) * limit;
    const inventories = await Inventory.findAndCountAll({
      order: [['createdAt', 'DESC']],
      where: {
        InventoryGroupId: group.id,
      },
      distinct: true, // count 버그 해결
      limit,
      offset,
    })
    res.status(200).json(inventories);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 재고보고서 상세데이터 가져오기
router.get('/report/:id', async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const inventory = await Inventory.findOne({
      where: {
        id: req.params.id,
      }
    });
    if(!inventory) {
      return res.status(403).send('재고보고서를 찾을수 없습니다.');
    }
    const group = await InventoryGroup.findOne({
      where: {
        id: inventory.InventoryGroupId
      }
    });
    if(!group) {
      return res.status(403).send('재고 보고서 그룹을 찾을수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== group.UserId) {
      return res.status(403).send('권한이 없습니다.');
    }

    const inventoryDetails = await InventoryDetail.findAll({
      where: {
        InventoryId: inventory.id
      },
      include: [{
        model: Stock,
      },]
    })
    const data = {
      inventory: inventory,
      datas: inventoryDetails
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});



// 재고품목 가져오기
router.get('/stocks/:userId', isLoggedIn, async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      }
    });
    if(!user) {
      return res.status(403).send('유저를 찾을수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== user.id) {
      return res.status(403).send('권한이 없습니다.');
    }
    const stocks = await Stock.findAll({
      where: {
        UserId: user.id,
        isDeleted: false,
      }
    })
    res.status(200).json(stocks);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});



// 재고보고서 작성
router.post('/create', isLoggedIn, async (req, res, next) => {
  try {
    const loggedInUser = await User.findOne({ // 작성자 체크
      where: {
        id: req.user.id
      }
    })
    if (req.body.memo?.length > 99) {
      return res.status(401).send('메모가 100자(줄바꿈 포함)를 초과했습니다.');
    }
    const user = await User.findOne({
      where: {
        id: req.body.UserId
      }
    })
    if(!user){
      return res.status(403).send('유저를 찾을수 없습니다.');
    }
    const group = await InventoryGroup.findOne({
      where: {
        id: req.body.GroupId
      }
    })
    if(!group){
      return res.status(403).send('재고보고서 그룹을 찾을 수 없습니다.');
    }
    if (loggedInUser.role !== 'ADMINISTRATOR' && loggedInUser.id !== user.id) {
      return res.status(403).send('권한이 없습니다.');
    }
    const dataArray = req.body.datas;
    let stocks = [];
    let stockIds = [];
    dataArray.map((v) => {
      stockIds.push(v.stockId);
    })
    if (stockIds.length >= 1) {
      stocks = await Stock.findAll({  // 해당되는 재고품들 찾기
        where: {
          id: {
            [Op.or]: stockIds
          }
        }
      });
    }
    if (stocks.length < 1) {
      return res.status(403).send('재고품목 데이터가 없습니다.');
    }
    const inventory = await Inventory.create({
      memo: req.body.memo,
      InventoryGroupId: group.id
    })
    const inventoryDetailDatas = dataArray?.map((data) => {
      return {
        UserId: user.id,
        InventoryId: inventory.id,
        StockId: data.stockId,
        memo: data.memo,
        reqQty: data.reqQty,
        unit: data.unit,
        qty: data.qty,
        location: data.location,
        status: data.status,
      }
    })
    const inventoryDetails = await InventoryDetail.bulkCreate(inventoryDetailDatas);
    res.status(200).json(inventory);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


module.exports = router;
