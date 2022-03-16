export default interface User {
  id: string;
  hqNumber: string;
  password: string;
  company: string|null;
  name: string|null;
  phone: string|null;
  email: string|null;
  role: string;
  Providers: User[];
  Customers: User[];
}

// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define('User', { // MySQL에는 users 테이블 생성
//     id: { // 사업자번호
//       type: DataTypes.STRING(30),
//       allowNull: false, // 필수
//       unique: true, // 유일한 값
//       primaryKey: true, 
//     },
//     password: { // 비밀번호
//       type: DataTypes.STRING(100),
//       allowNull: false, // 필수
//     },
//     company : { // 회사명
//       type: DataTypes.STRING(20),
//       allowNull: false, // 필수
//     },
//     name : { // 담당자 이름
//       type: DataTypes.STRING(10),
//       allowNull: true,
//     },
//     phone: { // 담당자 전화번호
//       type: DataTypes.STRING(20),
//       allowNull: true,
//     },
//     email: { // 담당자 이메일
//       type: DataTypes.STRING(20),
//       allowNull: true,
//     },
//     role: { // 회원등급
//       type: DataTypes.STRING(15),
//       defaultValue: "NOVICE", 
//       // 비회원 NOVICE, 판매자 PROVIDER, 구매자 CUSTOMER, 판매-구매자 PROCUST, 관리자 ADMIN
//       allowNull: false, // 필수
//     },
//   },{
//     charset: 'utf8',
//     collate: 'utf8_general_ci' // 한글 처리
//   });
//   User.associate = (db) => { // 릴레이션(관계) 정의
//     db.User.hasMany(db.Address); // 주소목록
//     db.User.hasMany(db.Order); // 주문내역
//     db.User.hasMany(db.Item); // 등록한 제품.
//     db.User.belongsToMany(db.User, { through: 'UsersRelation', as: 'Providers', foreignKey: 'customerId' }); // 판매자-구매자 관계
//     db.User.belongsToMany(db.User, { through: 'UsersRelation', as: 'Customers', foreignKey: 'providerId' }); // 판매자-구매자 관계
//     db.User.belongsToMany(db.Item, { through: 'ItemUsers' }); // 열람가능한 제품
//   };
//   return User;
// };