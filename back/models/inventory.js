// 재고 보고서 테이블

module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', { //
    // id는 mySQL에서 자동 생성됨.
    memo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(12),
      allowNull: false,
      defaultValue: '',
    }
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci' // 한글 처리
  });
  Inventory.associate = (db) => { // 릴레이션(관계) 정의
    db.Inventory.hasMany(db.InventoryDetail);
  };
  return Inventory;
};