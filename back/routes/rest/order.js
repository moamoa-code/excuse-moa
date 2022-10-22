const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");

const { User, OrderDetail } = require("../../models"); // 시퀄라이즈 - MySQL DB연결
const { Item, Order, sequelize } = require("../../models"); // 시퀄라이즈 - MySQL DB연결
const { Op } = require("sequelize"); // 시퀄라이즈 연산자 사용

const { isLoggedIn, isProvider, isAdmin } = require("../middlewears"); // 로그인 검사 미들웨어
const { text } = require("express");

router.get("/", async (req, res, next) => {
  res.status(200).json("hi:1");
});

router.post("/old", isLoggedIn, async (req, res, next) => {
  console.log('!@@!!@/old', req.body)
  const transaction = await sequelize.transaction();
  try {
    const itemsArray = req.body.items;
    let itemIds = [];
    let tempItems = [];
    itemsArray.map((v) => {
      if (String(v.id).includes("F_")) {
        tempItems.push(v);
      } else {
        itemIds.push(v.id);
      }
    });

    let items = [];
    if (itemIds.length >= 1) {
      items = await Item.findAll({
        // 해당되는 제품들 찾기
        where: {
          id: {
            [Op.or]: itemIds,
          },
        },
      });
    }
    const provider = await User.findOne({
      // 판매자 찾기
      where: {
        id: req.body.providerId,
      },
    });
    const customer = await User.findOne({
      // 판매자 찾기
      where: {
        id: req.body.customerId,
      },
    });
    let name = req.body.name;
    if (req.body.name === "") {
      name = customer?.company;
    }
    let comment = req.body.comment;
    if (comment === null || comment === undefined || comment.length === 0) {
      comment = "POS입력";
    }
    const tWeight = req.body.totalWeight + "kg";
    const order = await Order.create(
      {
        // 주문 INSERT
        comment: comment,
        address: req.body.address,
        zip: "",
        name: name,
        phone: req.body.phone,
        ProviderId: provider.id,
        CustomerId: req.body.customerId,
        date: req.body.date?? new Date(),
        totalWeight: tWeight,
      },
      { transaction }
    );

    let orderDetail = [];
    if (items.length >= 1) {
      const orderDetailItems = items?.map((item) => {
        // 주문상세 데이터 작성
        const originalItem = itemsArray.find((v) => v.id === item.id);
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
        };
      });
      orderDetail = await OrderDetail.bulkCreate(orderDetailItems, {
        transaction,
      });
    }

    if (tempItems.length >= 1) {
      const orderDetailTempItems = tempItems.map((item) => {
        // 주문상세 데이터 작성
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
        };
      });
      await OrderDetail.bulkCreate(orderDetailTempItems, { transaction });
    }

    let totalPrice = 0;
    orderDetail?.map((item) => {
      let price = Number(item.itemSupplyPrice) ?? 0;
      if (
        isNaN(item.itemSupplyPrice) ||
        item.itemSupplyPrice === null ||
        item.itemSupplyPrice === undefined
      ) {
        price = 0;
      }
      return (totalPrice = totalPrice + price * Number(item.qty));
    });

    await order.update(
      {
        totalPrice: String(totalPrice),
      },
      { transaction }
    );

    // 오류없이 완료됐으면 커밋
    await transaction.commit();

    res.status(200).json(order.id);
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
