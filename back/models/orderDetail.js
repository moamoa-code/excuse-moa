// 주문상세 테이블.
// 제품과 수량을 기록하며 주문테이블에 종속된다.

module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define('OrderDetail', { // 
    // id는 mySQL에서 자동 생성됨.
    tag: {
      type: DataTypes.STRING(20), // 라벨지 등 표기사항
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false, // 필수
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING(20), // 포장완료, 취소, 보류 등
      allowNull: false, // 필수
      defaultValue: '작업중',
    },
    // 기록의 성격이기 때문에 제품을 참조로 가져오지 않고 값을 복사한다. (이름, 가격변동 등)
    // 제품별 판매량을 보기 위해 제품 아이디를 가져온다.
    OriginItemId: { // 원본 제품 아이디
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
    itemCodeName: { // 원두 코드명, 구매자에겐 비공개.
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    itemPackage: { // 제품 포장
      type: DataTypes.STRING(30),
      allowNull: true, // 필수
      defaultValue: '',
    },
    itemName: { // 제품 이름
      type: DataTypes.STRING(30),
      allowNull: false, // 필수
    },
    itemUnit: { // 수량단위
      type: DataTypes.STRING(10),
      allowNull: false, // 필수
    },
    itemMsrp: { // 권장소비가
      type: DataTypes.STRING(20),
      allowNull: true, // 
    },
    itemSupplyPrice: { // 공급단가
      type: DataTypes.STRING(20),
      allowNull: true, // 
    },
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci' // 한글 처리
  });
  OrderDetail.associate = (db) => { // 릴레이션(관계) 정의
    db.OrderDetail.belongsTo(db.Order); // 주문 ID
    db.User.hasMany(db.InventoryDetail); // 재고 보고서
  };
  return OrderDetail;
};