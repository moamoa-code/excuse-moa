// 재고 보고서 테이블

module.exports = (sequelize, DataTypes) => {
  const InventoryGroup = sequelize.define('InventoryGroup', { //
    // id는 mySQL에서 자동 생성됨.
    name: {
      type: DataTypes.STRING(25),
      allowNull: false, // 필수
    },
    desc: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isDeleted: { // 삭제 여부
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci' // 한글 처리
  });
  InventoryGroup.associate = (db) => { // 릴레이션(관계) 정의
    db.InventoryGroup.belongsTo(db.User); //
    db.InventoryGroup.hasMany(db.Inventory);
  };
  return InventoryGroup;
};