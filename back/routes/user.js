const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Operator. 연산자
const bcrypt = require('bcrypt'); // 비밀번호 암호화 라이브러리
const passport = require('passport');
const wait = require('waait');

const { User, Item, Address } = require('../models'); // 시퀄라이즈 - MySQL DB연결
// const db = require('../models');
const { isLoggedIn, isProvider, isNotLoggedIn, isAdmin } = require('./middlewears'); // 로그인 검사 미들웨어
const e = require('express');

// 판매자 목록 불러오기
router.get('/show-provider', async (req, res, next) => { // 
  try {
    const providers = await User.findAll({ 
      where: {
        role: 'PROVIDER',
      },
      attributes: {
        exclude: ["password", "phone", "email", "hqNumber"],
      }
    });
    if (!providers) {
      return res.status(403).send('회원이 존재하지 않습니다.');
    }
    res.status(200).json(providers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 모든 유저 목록 불러오기
router.get('/list', async (req, res, next) => { // 
  try {
    const userList = await User.findAll({
      where: {
        role: {
          [Op.not]: 'ADMINISTRATOR'
        }
      },
      order: [['createdAt', 'DESC']],
      attributes: {
        include: ["id", "company", "role", "name", "createdAt"],
        exclude: ["password", "phone", "email", "hqNumber"],
      },
    });
    res.status(200).json(userList);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 회원 등급 변경하기
router.patch('/update-role', isProvider, async (req, res, next) => {
  try {
    console.log(req.body);
    const user = await User.findOne({
      where: { id: req.body.userId }
    });
    if (user.role === 'ADMINISTRATOR') {
      return res.status(404).send('관리자는 변경 불가능합니다.');
    }
    const role = String(req.body.role).toUpperCase().trim();
    if (role !== 'PROVIDER' && role !== 'CUSTOMER' && role !== 'NOVICE' && role !== 'RESIGNED'){
      return res.status(404).send('잘못된 값입니다.');
    }
    if (!user) {
      return res.status(404).send('회원이 존재하지 않습니다.');
    }
    await User.update({
      role: role
    }, {
      where: { id: user.id },
    });
    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 정보수정
router.patch('/update', isLoggedIn, async (req, res, next) => { // post /user
  try {
    const user = await User.findOne({ 
      where: {
        id: req.body.userId,
      }
    });
    if (!user) {
      return res.status(403).send('사용자를 찾을 수 없습니다.');
    }
    const exUser = await User.findOne({
      where: {
        key: req.body.userKey,
      }
    })
    if (exUser) {
      if (exUser.id !== user.id) {
        return res.status(403).send('이미 사용중인 아이디 입니다.');
      }
    }
    const role = String(req.body.role).toUpperCase().trim();
    if (role !== 'PROVIDER' && role !== 'CUSTOMER' && role !== 'NOVICE'){
      return res.status(404).send('잘못된 값입니다.');
    }

    await User.update({
      key: req.body.userKey,
      company: req.body.company,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      role: role,
    }, {
      where: { id: user.id },
    });
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 비밀번호 변경
router.patch('/update-password', async (req, res, next) => { // post /user
  try {
    const user = await User.findOne({ // 아이디 DB에서 중복체크
      where: {
        id: req.body.userId,
      }
    });
    if (!user) {
      return res.status(403).send('사용자를 찾을 수 없습니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함

    await User.update({
      password: hashedPassword, // 암호화된 password
    }, {
      where: { id: user.id },
    });
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 특정 판매자 정보 불러오기
router.get('/provider-id/:userId', isProvider, async (req, res, next) => { // 
  try {
    const userDataWithItems = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: User,
          as: "Customers",
          attributes: ["id", "key", "company", "name"],
        }
      ]
    });
    if (userDataWithItems) {
      const data = userDataWithItems.toJSON();
      res.status(200).json(data);
    } else {
      const userData = await User.findOne({
        where: { id: req.params.userId },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: User,
            as: "Customers",
            attributes: ["id", "key", "company", "name"],
          }
        ]
      });
      if (userData) {
        const data = userData.toJSON();
        res.status(200).json(data);
      } else {
        res.status(404).send('존재하지 않는 사용자입니다.')
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 특정 판매자 정보 불러오기
router.get('/provider/:userKey', isAdmin, async (req, res, next) => { // 
  try {
    const userDataWithItems = await User.findOne({
      where: { key: req.params.userKey },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: User,
          as: "Customers",
          attributes: ["id", "key", "company", "name"],
        }
      ]
    });
    if (userDataWithItems) {
      const data = userDataWithItems.toJSON();
      res.status(200).json(data);
    } else {
      const userData = await User.findOne({
        where: { key: req.params.userKey },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: User,
            as: "Customers",
            attributes: ["id", "key", "company", "name"],
          }
        ]
      });
      if (userData) {
        const data = userData.toJSON();
        res.status(200).json(data);
      } else {
        res.status(404).send('존재하지 않는 사용자입니다.')
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주소 목록 불러오기
router.get('/addr/:userId', isLoggedIn, async (req, res, next) => { // GET /user 로그인 유지 위해 로그인한 유저의 정보 전송
  try {
    const user = await User.findOne({ 
      where: {
        id: req.params.userId,
      }
    });
    if (!user) {
      return res.status(403).send('회원이 존재하지 않습니다.');
    }
    const addrs = await Address.findAll({
      where: { UserId: user.id }
    })
    // console.log(JSON.stringify(userDataWithoutPassword));
    res.status(200).json(addrs);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 주소 삭제
router.patch('/addr/remove', isLoggedIn, async (req, res, next) => { // 
  // front의 data: { providerId:string, customerId:string }
  console.log('주소삭제',req.body);
  try {
    // const user = await User.findOne({ // 아이디 찾기
    //   where: {
    //     id: req.user.id,
    //   }
    // });
    // if (!user) {
    //   return res.status(403).send('아이디가 존재하지 않습니다.');
    // }
    const addr = await Address.findOne({
      where: {
        id: req.body.id,
      }
    });
    if (!addr) {
      return res.status(403).send('데이터가 존재하지 않습니다.')
    }
    await Address.destroy({
      where: { id: addr.id }
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 회사명으로 유저목록 검색
router.get("/search-company/:companyName", isProvider, async (req, res, next) => {
  try {
    console.log('req.params~~',req.params);

      const users = await User.findAll({
        where: {
          company: {
            [Op.like]: '%' + req.params.companyName + '%'
          }
        },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: User,
              as: "Providers",
              attributes: ["id", "key", "company"],
            }
          ]
      });
      return res.status(200).json(users);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 유저정보 불러오기
router.get("/:userKey", isLoggedIn, async (req, res, next) => {
  try {
    console.log('req.params~~',req.params);
    const userDataWithItems = await User.findOne({
      where: { key: req.params.userKey },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: User,
          as: "Providers",
          attributes: ["id", "key", "company"],
        }, {
          model: Item,
          as: "UserViewItems",
          attributes: ["id", "codeName", "name"],
          // where: { userKey: req.user.id }
        }
      ]
    });
    if (userDataWithItems) {
      const data = userDataWithItems.toJSON();
      return res.status(200).json(data);
    } else {
      const userData = await User.findOne({
        where: { key: req.params.userKey },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: User,
            as: "Providers",
            attributes: ["id", "key", "company"],
          }
        ]
      });
      if (userData) {
        const data = userData.toJSON();
        return res.status(200).json(data);
      } else {
        res.status(404).send('존재하지 않는 사용자입니다.')
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});


router.get("/id/:userId", isLoggedIn, async (req, res, next) => {
  try {
    console.log('req.params~~',req.params);
    const userDataWithItems = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: User,
          as: "Providers",
          attributes: ["id", "key", "company"],
        }, {
          model: Item,
          as: "UserViewItems",
          attributes: ["id", "codeName", "name"],
          // where: { userId: req.user.id }
        }
      ]
    });
    if (userDataWithItems) {
      const data = userDataWithItems.toJSON();
      return res.status(200).json(data);
    } else {
      const userData = await User.findOne({
        where: { id: req.params.userId },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: User,
            as: "Providers",
            attributes: ["id", "key", "company"],
          }
        ]
      });
      if (userData) {
        const data = userData.toJSON();
        return res.status(200).json(data);
      } else {
        res.status(404).send('존재하지 않는 사용자입니다.')
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 로그인 유저 정보 얻기
router.get('/', async (req, res, next) => { // GET /user 로그인 유지 위해 로그인한 유저의 정보 전송
  wait(30000);
  try {
      if (req.user) { // 로그인 됐을경우
        const userDataWithoutPassword = await User.findOne({
          // 프론트로 보낼 유저 정보를 재가공
          where: { id: req.user.id },
          attributes: {
            exclude: ['password'], // 비밀번호 제외
          },
          include: [
            {
              model: User,
              as: "Customers",
              attributes: ["id", "key", "company", "name", "phone"],
              exclude: ['UsersRelation'],
            }
          ]
        })
        res.status(200).json(userDataWithoutPassword);
        // console.log(JSON.stringify(userDataWithoutPassword));
      } else {
        res.status(200).json(null);
      }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 로그인 -> passport/local.js
router.post('/login', (req, res, next) => {
  // console.log('/login', req.body);
  passport.authenticate('local', (err, user, info) => {
    // (서버에러, 성공, 클라이언트에러)
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) { // 클라이언트 입력 애러시
      console.log(info);
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => { // 실제 패스포트 로그인 처리
      // console.log('req.login', user)
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const userDataWithoutPassword = await User.findOne({
        // 프론트로 보낼 유저 정보를 재가공
        where: { id: user.id },
        // attributes: ['id', 'nickname', 'email'], // DB에서 가져올 속성들 정할 수 있음
        attributes: {
          exclude: ['password'], // 비밀번호 제외
        }
      })
      return res.status(200).json(userDataWithoutPassword); // 클라이언트에 user 정보 보냄.
    })
  })(req, res, next); // 미들웨어 확장 문법.
});

// 로그아웃
router.post('/logout', isLoggedIn, (req, res) => {
  // console.log('logut', req.body.data);
  req.logout();
  req.session.destroy();
  res.status(200).send('ok');
});

// 회원/고객생성
router.post('/create/', isLoggedIn, async (req, res, next) => { // post /user
  // front의 data: { providerId: string, id: string, password: string, company: string, name: string|null, phone: string|null, email: string|null }를 axios 통해 받음
  console.log('고객등록 req.body',req.body);
  try {
    const exUser = await User.findOne({ // 아이디 DB에서 중복체크
      where: {
        key: String(req.body.key).trim(),
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디 입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함
    if (req.body.key.length < 1) {
      return res.status(403).send('아이디를 입력해 주세요.')
    }
    // role이 없는경우 판매회원의 CUSTOMER 생성
    if (req.body.role === undefined || req.body.role === null || req.body.role === ''){
      const provider = await User.findOne({
        where: {
          key: req.body.providerKey
        }
      })
      if (!provider) {
        return res.status(403).send('공급사가 존재하지 않습니다.')
      }
      const customer = await User.create({
        key: req.body.key,
        password: hashedPassword, // 암호화된 password
        company: req.body.company,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        hqNumber: req.body.hqNumber,
        role: 'CUSTOMER',
        ProviderId: provider.id
      });
      // 주소 있으면 생성
      if (req.body.addrData.zip !== undefined && req.body.addrData.zip !== null && req.body.addrData.zip !== '') {
        const addr = await Address.create({
          addrName: req.body.company,
          zip: req.body.addrData.zip,
          address: req.body.addrData.address,
          name: req.body.name,
          phone: req.body.phone,
          UserId: customer.id
        })
      }
      // await provider.addCustomers(customer);
      await customer.addProviders(provider);
      return res.status(201).send({ key: customer.key, company: customer.company, name: customer.name });
    }
    // 판매자 회원 생성
    if (String(req.body.role).toUpperCase().trim() === 'PROVIDER') {
      const provider = await User.create({
        key: req.body.key,
        role: 'PROVIDER',
        password: hashedPassword, // 암호화된 password
        company: req.body.company,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        hqNumber: req.body.hqNumber,
      });
      // 주소 있으면 생성
      if (req.body.addrData.zip !== undefined && req.body.addrData.zip !== null && req.body.addrData.zip !== '') {
        const addr = await Address.create({
          addrName: req.body.company,
          zip: req.body.addrData.zip,
          address: req.body.addrData.address,
          name: req.body.name,
          phone: req.body.phone,
          UserId: provider.id
        })
      }
      return res.status(201).send({ key: provider.key, company: provider.company, name: provider.name });
    }
    // 구매회원 생성
    if (String(req.body.role).toUpperCase().trim() === 'CUSTOMER') {
      let customer;
      const provider = await User.findOne({
        where: {
          key: req.body.providerKey
        }
      })
      if (!provider) {
        customer = await User.create({
          key: req.body.key,
          role: 'CUSTOMER',
          password: hashedPassword, // 암호화된 password
          company: req.body.company,
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          hqNumber: req.body.hqNumber,
        });
        // 주소 있으면 생성
        if (req.body.addrData.zip !== undefined && req.body.addrData.zip !== null && req.body.addrData.zip !== '') {
          const addr = await Address.create({
            addrName: req.body.company,
            zip: req.body.addrData.zip,
            address: req.body.addrData.address,
            name: req.body.name,
            phone: req.body.phone,
            UserId: customer.id
          })
        }
        return res.status(201).send({ key: customer.key, company: customer.company, name: customer.name });
      }
      customer = await User.create({
        key: req.body.key,
        role: 'CUSTOMER',
        password: hashedPassword, // 암호화된 password
        company: req.body.company,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        hqNumber: req.body.hqNumber,
        ProviderId: provider.id
      });
      await customer.addProviders(provider);
      // await provider.addCustomers(customer);
      // 주소 있으면 생성
      if (req.body.addrData.zip !== undefined && req.body.addrData.zip !== null && req.body.addrData.zip !== '') {
        const addr = await Address.create({
          addrName: req.body.company,
          zip: req.body.addrData.zip,
          address: req.body.addrData.address,
          name: req.body.name,
          phone: req.body.phone,
          UserId: customer.id
        })
      }
      return res.status(201).send({ key: customer.key, company: customer.company, name: customer.name });
    }
    // 비회원 생성
    if (String(req.body.role).toUpperCase().trim() === 'NOVICE') {
      const user = await User.create({
        key: req.body.key,
        role: 'NOVICE',
        password: hashedPassword, // 암호화된 password
        company: req.body.company,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        hqNumber: req.body.hqNumber,
      });
      // 주소 있으면 생성
      if (req.body.addrData.zip !== undefined && req.body.addrData.zip !== null && req.body.addrData.zip !== '') {
        const addr = await Address.create({
          addrName: req.body.company,
          zip: req.body.addrData.zip,
          address: req.body.addrData.address,
          name: req.body.name,
          phone: req.body.phone,
          UserId: user.id
        })
      }
      return res.status(201).send('ok');

    }

  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 복수 회원 생성
router.post('/multi-create', isProvider, async (req, res, next) => { // post /user
  console.log('multi-create',req.body);
  try {
    const hashedPassword = await bcrypt.hash('123123', 10);
    let error = false;
    const errorCheck = req.body.userDatas.map((v) => {
      if (!req.body.isAutoKey) {
        if (v.key.length < 1) {
          return error = true;
        }
      }
    });
    if (error) {
      return res.status(400).send('아이디를 입력해 주세요.')
    }

    // 판매자, 비회원 생성
    if (req.body.role === 'PROVIDER' || req.body.role === 'NOVICE'){
      const userDatas = req.body.userDatas.map((v) => { 
        const randomKey = Math.random().toString(36).substr(2,10); // key자동생성일 경우
        return {
          key: req.body.isAutoKey? randomKey : v.key,
          password: hashedPassword, // 암호화된 password
          company: v.company,
          name: v.name,
          phone: v.phone,
          role: req.body.role,
        }
      });
      const users = await User.bulkCreate(userDatas); 
      if(req.body.isAddrMode){ // 주소 있으면 생성
        const userIds = users.map((v)=>(v.id));
        const addrDatas = req.body.userDatas.map((v, i) => { 
          return {
            addrName: v.name,
            zip: v.zip,
            name: v.name,
            phone: v.phone,
            address: v.address,
            UserId: userIds[i],
          }
        });
        const addresses = await Address.bulkCreate(addrDatas); 
        if (!addresses) {
          return res.status(400).send('회원생성은 성공했지만 주소생성 중 문제가 발생했습니다.');
        }
      }
      return res.status(200).send('ok');
    }
    // 구매자 생성
    if (req.body.role === 'CUSTOMER'){
      const provider = await User.findOne({
        where: {
          key: req.body.ProviderKey
        }
      });
      if (!provider) {
        return res.status(404).send('해당 판매자가 존재하지 않습니다.')
      }
      const userDatas = req.body.userDatas.map((v) => { 
        const randomKey = Math.random().toString(36).substr(2,10); // key자동생성일 경우
        return {
          key: req.body.isAutoKey? randomKey : v.key,
          password: hashedPassword, // 암호화된 password
          company: v.company,
          name: v.name,
          phone: v.phone,
          role: 'CUSTOMER',
          ProviderId: provider.id
        }
      });
      const users = await User.bulkCreate(userDatas); 
      await provider.addCustomers(users); // 판매자에 구매자 등록
      if(req.body.isAddrMode){ // 주소 있으면 생성
        const userIds = users.map((v)=>(v.id));
        const addrDatas = req.body.userDatas.map((v, i) => { 
          return {
            addrName: v.name,
            zip: v.zip,
            name: v.name,
            phone: v.phone,
            address: v.address,
            UserId: userIds[i],
          }
        });
        const addresses = await Address.bulkCreate(addrDatas); 
        if (!addresses) {
          return res.status(400).send('회원생성은 성공했지만 주소생성 중 문제가 발생했습니다.');
        }
      }
      return res.status(200).json(users);
    }
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 회원가입
router.post('/', isNotLoggedIn, async (req, res, next) => { // post /user
  console.log('회원가입 req.body',req.body);
  try {
    const exUser = await User.findOne({ // 아이디 DB에서 중복체크
      where: {
        key: req.body.key,
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디 입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함
    await User.create({
      key: req.body.key,
      password: hashedPassword, // 암호화된 password
      company: req.body.company,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      hqNumber: req.body.hqNumber
    });
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3060');
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 정보수정
router.patch('/edit', isLoggedIn, async (req, res, next) => { // post /user
  console.log('정보수정 req.body',req.body);
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      }
    });
    if (!user) {
      return res.status(403).send('로그인이 필요합니다.');
    }
    const exUser = await User.findOne({
      where: {
        key: req.body.key,
      }
    })
    if (exUser) {
      if (exUser.id !== user.id) {
        return res.status(403).send('이미 사용중인 아이디 입니다.');
      }
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함

    await User.update({
      key: req.body.key,
      password: hashedPassword, // 암호화된 password
      company: req.body.company,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      hqNumber: req.body.hqNumber
    }, {
      where: { id: user.id },
    });
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 회원 탈퇴 신청
router.patch('/resign', isLoggedIn, async (req, res, next) => { // post /user
  try {
    const user = await User.findOne({
      where: {
          id: req.user.id,
      }
    });
    if (!user) {
      return res.status(403).send('사용자를 찾을 수 없습니다.');
    }
    user.update({role: 'RESIGNED'});
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 회원 삭제
router.patch('/terminate', isAdmin, async (req, res, next) => { // post /user
  try {
    const user = await User.findOne({
      where: {
        key: req.body.userKey
      }
    });
    if (!user) {
      return res.status(403).send('사용자를 찾을 수 없습니다.');
    }
    if (user.role === 'TERMINATED') { // 탈퇴된 회원이면 완전삭제
      await user.destroy({
        where: { id: user.id }
      })
      return res.status(201).send('ok');
    }
    user.update({
      memo: user.key
    });
    const newKey = 'X_' + String(req.body.userKey).slice(-4) + Math.random().toString(36).substr(2,4);
    const exUser = await User.findOne({
      where: {
        key: newKey
      }
    })
    if (exUser) {
      return res.status(403).send('다시 시도해주세요.');
    }
    user.update({
      role: 'TERMINATED',
      key: newKey
    });
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 주소 추가
router.post('/addr', isLoggedIn, async (req, res, next) => { // post /user
  console.log('주소추가 #@#@#@',req.body);
  try {
    const user = await User.findOne({ 
      where: {
        id: req.user.id,
      }
    });
    if (!user) {
      return res.status(403).send('회원이 존재하지 않습니다.');
    }
    const addr = await Address.create({
      addrName: req.body.addrName,
      zip: req.body.zip,
      address: req.body.address,
      name: req.body.name,
      phone: req.body.phone,
      UserId: user.id
    })

    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 주소 추가
router.post('/add-addr', isProvider, async (req, res, next) => { // post /user
  console.log('주소추가 #@#@#@',req.body);
  try {
    const user = await User.findOne({ 
      where: {
        id: req.body.UserId,
      }
    });
    if (!user) {
      return res.status(403).send('회원이 존재하지 않습니다.');
    }
    const addr = await Address.create({
      addrName: req.body.name,
      zip: req.body.zip,
      address: req.body.address,
      name: req.body.name,
      phone: req.body.phone,
      UserId: user.id
    })

    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 고객등록
router.patch('/add-customer', isLoggedIn, async (req, res, next) => { // 
  // front의 data: { providerId:string, customerId:string }
  console.log('고객등록',req.body);
  try {
    const customer = await User.findOne({ // 아이디 찾기
      where: {
        key: req.body.customerKey,
      }
    });
    const provider = await User.findOne({ // 아이디 찾기
      where: {
        key: req.body.providerKey,
      }
    });
    if (!customer || !provider) {
      return res.status(403).send('해당 아이디가 존재하지 않습니다.');
    }
    const myProvider = await customer.getProviders();
    if (myProvider.length >= 1) {
      if (myProvider.find((v) => v.id !== provider.id)) {
        return res.status(403).send('이미 다른 판매자에 소속된 유저입니다. 관리자에 문의하세요.');
      }
    }
    if (customer.role === 'NOVICE') {
      await customer.update({role: 'CUSTOMER'});
    }
    await customer.addProviders(provider);
    await customer.update({ProviderId: provider.id});
    // await provider.addCustomers(customer.id);
    const userDataWithoutPassword = await User.findOne({
      // 프론트로 보낼 유저 정보를 재가공
      where: { id: customer.id },
      attributes: {
        exclude: ['password'], // 비밀번호 제외
      },
    })
    res.status(200).json(userDataWithoutPassword);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 고객삭제
router.patch('/delete-customer', isLoggedIn, async (req, res, next) => { // 
  try {
    const customer = await User.findOne({ // 아이디 찾기
      where: {
        key: req.body.customerKey,
      }
    });
    const provider = await User.findOne({ // 판매자 아이디 찾기
      where: {
        key: req.body.providerKey,
      }
    });
    if (!customer || !provider) {
      return res.status(403).send('해당 아이디가 존재하지 않습니다.');
    }

    const items = await customer.getUserViewItems({
      where: { UserId: provider.id}
    })
    await customer.removeUserViewItems(items); // 고객에 등록된 판매자 아이템 제거.
    await provider.removeCustomers(customer.id);
    await customer.update({ProviderId: null});

    console.log('@##@%#!', items);
    const userDataWithoutPassword = await User.findOne({
      // 프론트로 보낼 유저 정보를 재가공
      where: { id: customer.id },
      attributes: {
        exclude: ['password'], // 비밀번호 제외
      },
    })
    res.status(200).json(userDataWithoutPassword);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 고객에 열람가능한 제품 추가
router.patch('/add-item', isProvider, async (req, res, next) => {
  // {itemId: number, customerId: string}
  try {
    const item = await Item.findOne({
      where: { id: req.body.itemId }
    });
    if (!item) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    const user = await User.findOne({
      where: { key: req.body.customerKey }
    });
    if (!user) {
      return res.status(404).send('해당 회원이 존재하지 않습니다.')
    }
    const itemUser = await user.addUserViewItems(item.id)
    console.log('\x1b[36m',itemUser);
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 고객에 열람가능한 제품 제거
router.patch('/remove-item', isProvider, async (req, res, next) => {
  // {itemId: number, customerId: string}
  try {
    console.log(req.body);
    const item = await Item.findOne({
      where: { id: req.body.itemId }
    });
    if (!item) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    const user = await User.findOne({
      where: { key: req.body.customerKey }
    });
    if (!user) {
      return res.status(404).send('해당 회원이 존재하지 않습니다.')
    }
    const itemUser = await user.removeUserViewItems(item.id)
    console.log('\x1b[36m',itemUser);
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

module.exports = router;
