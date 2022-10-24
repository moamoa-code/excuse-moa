const { User, OrderDetail } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { sequelize, Item } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Order } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Op } = require('sequelize'); // 시퀄라이즈 연산자 사용

class OrderService {
  /** 주문서 작성 */
  async orderItem(body) {
    try {
      // 입력 데이터 검증
      if (!body.items) {
        return { error: '데이터가 입력되지 않았습니다.' };
      }
      const itemsArray = body.items;
      let itemIds = [];
      let tempItems = [];
      itemsArray.map((v) => {
        if (String(v.id).includes('F_')) {
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
          id: body.providerId,
        },
      });
      const customer = await User.findOne({
        // 구매자 찾기
        where: {
          id: body.customerId,
        },
      });
      if (!provider) {
        return { error: '해당 판매자를 찾을수 없습니다.' };
      }
      await sequelize.transaction(async (transaction) => {
        let name = body.name;
        if (body.name === '') {
          name = customer?.company;
        }
        let comment = body.comment;
        if (comment === null || comment === undefined || comment.length === 0) {
          comment = '관리자입력';
        }
        const tWeight = body.totalWeight + 'kg';
        const order = await Order.create(
          {
            // 주문 INSERT
            comment: comment,
            address: body.address,
            zip: '',
            name: name,
            phone: body.phone,
            ProviderId: provider.id,
            CustomerId: body.customerId,
            totalWeight: tWeight,
          },
          { transaction },
        );

        let orderDetail = [];
        if (items.length >= 1) {
          const orderDetailItems = items?.map((item) => {
            // 주문상세 데이터 작성 (존재하는 상품)
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
          orderDetail = await OrderDetail.bulkCreate(orderDetailItems, { transaction });
        }

        if (tempItems.length >= 1) {
          const orderDetailTempItems = tempItems.map((item) => {
            // 주문상세 데이터 작성 (입력된 임시상품)
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
          { transaction },
        );
        return order.id;
      });
    } catch (error) {
      return { error };
    }
  }

  /** 구매자의 주문목록 가져오기 */
  async getOrderListCutomerSide(userId, startDate, endDate) {
    try {
      let from = new Date(startDate);
      from.setHours('0');
      let til = new Date(endDate);
      til.setHours('23');
      til.setMinutes('59');
      til.setSeconds('59');
      const order = await Order.findAll({
        where: {
          customerId: userId,
          date: { [Op.between]: [from, til] },
        },
        order: [['createdAt', 'DESC']],
        // attributes: ["id", "date", "totalPice", "comment", "address", "zip", "phone", "name", "isConfirmed", "isCanceled"],
        include: [
          {
            model: User,
            as: 'Provider',
            attributes: ['id', 'company', 'key', 'name', 'phone'],
          },
          {
            model: User,
            as: 'Customer',
            attributes: ['id', 'company', 'key', 'name', 'phone'],
          },
        ],
      });
      if (!order) {
        return { error: '해당 주문이 존재하지 않습니다.' };
      }
      return order;
    } catch (error) {
      return { error };
    }
  }
}

module.exports = new OrderService();
