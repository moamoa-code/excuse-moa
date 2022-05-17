// 원자재 / 재고품

module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define('Stock', { //
    // id는 mySQL에서 자동 생성됨.
    type: {
      type: DataTypes.STRING(20),
      allowNull: false, // 필수
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false, // 필수
    },
    desc: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    imgSrc: { // 이미지
      type: DataTypes.STRING(200),
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
  Stock.associate = (db) => { // 릴레이션(관계) 정의
    db.Stock.belongsTo(db.User);
  };
  return Stock;
};