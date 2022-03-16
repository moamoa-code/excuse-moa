// 주문 테이블
// 구매자와 배송주소를 기록한다.

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', { //
    // id는 mySQL에서 자동 생성됨.
    date: {
      type: DataTypes.DATE,
      allowNull: false, // 필수
      defaultValue: DataTypes.NOW,
    },
    totalPrice: {
      type: DataTypes.STRING(20),
      allowNull: true, //
    },
    comment: { // 배송 요구사항
      type: DataTypes.STRING(200),
      allowNull: true, //
    },
    message: { // 취소 사유, 송장번호 등
      type: DataTypes.STRING(100),
      allowNull: true, //
    },
    // 기록의 성격이기 때문에 유저의 주소를 참조로 가져오지 않고 값을 복사한다.
    address: { //주소
      type: DataTypes.STRING(100),
      allowNull: true, 
    },
    zip: { // 우편번호
      type: DataTypes.STRING(10),
      allowNull: true, // 
    },
    phone: { // 받는분 전화번호
      type: DataTypes.STRING(20),
      allowNull: true, //
    },
    name: { // 받는분 이름
      type: DataTypes.STRING(20),
      allowNull: true, // 
    },
    status: { // 주문 진행상태  retailStatus
      type: DataTypes.STRING(20),
      allowNull: false, //
      defaultValue: '주문요청', // 주문요청, 주문 완료, 취소 완료
    },
    factoryStatus: { // 포장/배송 완료
      type: DataTypes.STRING(20), 
      allowNull: false, 
      defaultValue: '작업중', // 작업중, 출하
    },
    isCanceled: { // 구매자가 취소신청함
      type: DataTypes.BOOLEAN,
      allowNull: false, //
      defaultValue: false,
    },
  },{
    charset: 'utf8',
    collate: 'utf8_general_ci' // 한글 처리
  });
  Order.associate = (db) => { // 릴레이션(관계) 정의
    db.Order.hasMany(db.OrderDetail); // 주문상세
    db.Order.belongsTo(db.User, { as: 'Provider'}); // 공급자
    db.Order.belongsTo(db.User, { as: 'Customer'}); // 주문자 유저
  };
  return Order;
};