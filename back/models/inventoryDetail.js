// 재고품 상세 테이블

module.exports = (sequelize, DataTypes) => {
  const InventoryDetail = sequelize.define('InventoryDetail', { //
    // id는 mySQL에서 자동 생성됨.
    reqQty: { // 요구수량
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1.0,
    },
    qty: { // 현재수량
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1.0,
    },
    unit: { // 수량단위
      type: DataTypes.STRING(10),
      defaultValue: '개',
      allowNull: false,
    },
    tag: {  // 옵션
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    location: { // 재고 위치
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(12),
      allowNull: false,
      defaultValue: 'OK'
    },
    memo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci' // 한글 처리
  });
  InventoryDetail.associate = (db) => { // 릴레이션(관계) 정의
    db.InventoryDetail.belongsTo(db.Inventory); // 재고 보고서
    db.InventoryDetail.belongsTo(db.Stock); // 재고 아이템
  };
  return InventoryDetail;
};