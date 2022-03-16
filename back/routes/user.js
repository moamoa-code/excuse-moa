const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Operator. 연산자
const bcrypt = require('bcrypt'); // 비밀번호 암호화 라이브러리
const passport = require('passport');

const { User, Item, Address } = require('../models'); // 시퀄라이즈 - MySQL DB연결
// const db = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewears'); // 로그인 검사 미들웨어
const e = require('express');

// 판매자 목록 불러오기
router.get('/show-provider', async (req, res, next) => { // 
  try {
    const providers = await User.findAll({ 
      where: {
        role: 'PROVIDER',
      },
      attributes: ["id", "company", "name"],
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

// 특정 판매자 정보 불러오기
router.get('/provider/:userId', async (req, res, next) => { // 
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
          attributes: ["id", "company"],
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
            attributes: ["id", "company"],
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
    const user = await User.findOne({ // 아이디 찾기
      where: {
        id: req.user.id,
      }
    });
    if (!user) {
      return res.status(403).send('아이디가 존재하지 않습니다.');
    }
    const addr = await Address.findOne({
      where: {
        id: req.body.id,
        UserId: user.id
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

router.get("/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const userDataWithItems = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: User,
          as: "Providers",
          attributes: ["id", "company"],
        }, {
          model: Item,
          as: "UserViewItems",
          attributes: ["id", "codeName", "name"],
          where: { UserId: req.user.id }
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
            as: "Providers",
            attributes: ["id", "company"],
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

// 로그인 유저 정보 얻기
router.get('/', async (req, res, next) => { // GET /user 로그인 유지 위해 로그인한 유저의 정보 전송
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
              attributes: ["id", "company", "name"],
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

// 고객생성
router.post('/create/', isLoggedIn, async (req, res, next) => { // post /user
  // front의 data: { providerId: string, id: string, password: string, company: string, name: string|null, phone: string|null, email: string|null }를 axios 통해 받음
  console.log('고객등록 req.body',req.body);
  try {
    const provider = await User.findOne({
      where: {
        id: req.body.providerId
      }
    })
    if (!provider) {
      return res.status(403).send('공급사가 존재하지 않습니다.')
    }
    const exUser = await User.findOne({ // 아이디 DB에서 중복체크
      where: {
          id: req.body.id,
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디 입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함
    const customer = await User.create({
      id: req.body.id,
      password: hashedPassword, // 암호화된 password
      company: req.body.company,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      hqNumber: req.body.hqNumber,
      role: 'CUSTOMER',
    });
    await provider.addCustomers(customer);
    res.status(201).send({ id: customer.id, company: customer.company, name: customer.name });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 회원가입
router.post('/', isNotLoggedIn, async (req, res, next) => { // post /user
  // front의 data: { id: string, password: string, company: string, name: string|null, phone: string|null, email: string|null }를 axios 통해 받음
  console.log('회원가입 req.body',req.body);
  try {
    const exUser = await User.findOne({ // 아이디 DB에서 중복체크
      where: {
          id: req.body.id,
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디 입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함
    await User.create({
      id: req.body.id,
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
    const user = await User.findOne({ // 아이디 DB에서 중복체크
      where: {
          id: req.user.id,
      }
    });
    if (!user) {
      return res.status(403).send('사용자를 찾을 수 없습니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 두번째 인자 높을수록 암호화 강함

    await User.update({
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

// 고객등록
router.patch('/addcustomer', isLoggedIn, async (req, res, next) => { // 
  // front의 data: { providerId:string, customerId:string }
  console.log('고객등록',req.body);
  try {
    const customer = await User.findOne({ // 아이디 찾기
      where: {
        id: req.body.customerId,
      }
    });
    const provider = await User.findOne({ // 아이디 찾기
      where: {
        id: req.body.providerId,
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
      customer.update({role: 'CUSTOMER'});
    }
    await provider.addCustomers(req.body.customerId);
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
router.patch('/deletecustomer', isLoggedIn, async (req, res, next) => { // 
  // front의 data: { providerId:string, customerId:string }
  console.log('고객삭제',req.body);
  try {
    const customer = await User.findOne({ // 아이디 찾기
      where: {
        id: req.body.customerId,
      }
    });
    const provider = await User.findOne({ // 판매자 아이디 찾기
      where: {
        id: req.body.providerId,
      }
    });
    if (!customer || !provider) {
      return res.status(403).send('해당 아이디가 존재하지 않습니다.');
    }

    const items = await customer.getUserViewItems({
      where: { UserId: provider.id}
    })
    await customer.removeUserViewItems(items); // 고객에 등록된 판매자 아이템 제거.
    await provider.removeCustomers(req.body.customerId);

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
router.patch('/add-item', isLoggedIn, async (req, res, next) => {
  // {itemId: number, customerId: string}
  try {
    console.log(req.body);
    const item = await Item.findOne({
      where: { id: req.body.itemId}
    });
    if (!item) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    const user = await User.findOne({
      where: { id: req.body.customerId}
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
router.patch('/remove-item', isLoggedIn, async (req, res, next) => {
  // {itemId: number, customerId: string}
  try {
    console.log(req.body);
    const item = await Item.findOne({
      where: { id: req.body.itemId}
    });
    if (!item) {
      return res.status(404).send('해당 제품이 존재하지 않습니다.');
    }
    const user = await User.findOne({
      where: { id: req.body.customerId}
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
