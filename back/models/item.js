// 모델 -> 대문자 단수, MySQL 소문자 복수
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', { // MySQL에는 users 테이블 생성
    // id는 mySQL에서 자동 생성됨.
    codeName: { // 원두 코드명 
      type: DataTypes.STRING(10),
      allowNull: false, // 필수
    },
    name: { // 제품 이름
      type: DataTypes.STRING(50),
      allowNull: false, // 필수
    },
    packageName: {
      type: DataTypes.STRING(30),
      allowNull: true, // 필수
    },
    unit: { // 수량단위
      type: DataTypes.STRING(10),
      allowNull: false, // 필수
    },
    msrp: { // 권장소비가
      type: DataTypes.STRING(20),
      allowNull: true, // 
    },
    supplyPrice: { // 공급단가
      type: DataTypes.STRING(20),
      allowNull: true, // 
    },
    imgSrc: { // 제품 사진
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    description: { // 상세설명
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },{
    charset: 'utf8',
    collate: 'utf8_general_ci' // 한글 처리
  });
  Item.associate = (db) => { // 릴레이션(관계) 정의
    db.Item.belongsTo(db.User); // 제품 등록한 유저
    db.Item.belongsToMany(db.User, { through: 'ItemUsers', as: 'ItemViewUsers'}); // 제품 노출할 유저
    db.Item.belongsToMany(db.User, { through: "Carts", as: 'user'}); // 장바구니
  };
  return Item;
};