// 주소록 테이블
// 유저는 여러 주소를 가질 수 있다.

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', { // MySQL에는 users 테이블 생성
    // id는 mySQL에서 자동 생성됨.
    addrName: { // 배송지명
      type: DataTypes.STRING(20),
      allowNull: false, 
    },
    address: { // 주소
      type: DataTypes.STRING(100),
      allowNull: false, 
    },
    zip: { // 우편번호
      type: DataTypes.STRING(10),
      allowNull: false, // 
    },
    phone: { // 받는분 전화번호
      type: DataTypes.STRING(20),
      allowNull: false, //
    },
    name: { // 받는분 이름
      type: DataTypes.STRING(20),
      allowNull: false, // 
    },
  },{
    charset: 'utf8',
    collate: 'utf8_general_ci' // 한글 처리
  });
  Address.associate = (db) => { // 릴레이션(관계) 정의
    db.Address.belongsTo(db.User); // 유저
  };
  return Address;
};

