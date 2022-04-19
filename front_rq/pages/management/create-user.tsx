// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';

import { loadMyInfoAPI, createUserAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import DaumPostcode from 'react-daum-postcode';

const ErrorMessage = styled.div`
  color: red;
`;
const RedBold = styled.span`
  color:red;
`
const Container500 = styled.div`
  max-width: 500px;
  margin 0 auto;
  padding: 10px;
`
const Block = styled.div`
  margin: 18px 0 18px 0;
  label {
    display: block;
    margin: 0 0 7px 0;
  }
  input {
    width: 100%;
    height: 38px;
  }
`


const MoDal = styled.div`
  overflow: auto;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 8;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #ffffffe2;
  animation: fadein 0.2s;
  @keyframes fadein {
    from {
      opacity: 0;
      top: -100px;
    }
    to {
      opacity: 1;
      top: 0;
    }
}
  .contents {
    overflow: auto;
    min-width: 500px;
    max-width: 90%;
    max-height: 90%;
    z-index: 9;
    padding: 15px;
    background-color: white;
    border-radius: 10px;
    -webkit-box-shadow: 1px 1px 15px 3px rgba(0,0,0,0.34); 
    box-shadow: 1px 1px 15px 3px rgba(0,0,0,0.34);
    transition: opacity 1s;
  }
  .close {
    margin-top: 10px;
    float:right;
  }
`

const CreateUser = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [providerKey, setProviderKey] = useState(myUserInfo.key);
  const [form] = Form.useForm();

  const [key, setKey] = useState('');
  const [company, onChangeCompany, setCompany] = useInput('');
  const [name, onChangeName, setName] = useInput('');
  const [phone, setPhone] = useState('');
  const [email, onChangeEmail, setEmail] = useInput('');
  const [password, setPassword] = useState('');
  const [hqNumber, onChangeHq, setHqNumber] = useInput('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordValidError, setPasswordValidError] = useState(false);
  const [keyValidError, setKeyValidError] = useState(false);
  const [phoneValidError, setPhoneValidError] = useState(false);
  const [disableBtn, setDisableBtn] = useState(true);
  const [term, setTerm] = useState(false);
  const [termError, setTermError] = useState(false);

  const [ isVisible, setIsVisible ] = useState(false);
  const [ zip, setZip ] = useState('');
  const [ address, onChangeAddress, setAddress ] = useInput<string>('');
  const [ address2, onChangeAddress2, setAddress2 ] = useInput<string>('');
  const modalOutside = useRef(); // 모달 바깥부분 클릭시 닫기 위한 ref

  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    setTermError(false);
  }, []);

  useEffect(() => { // 유효성 검사완료시 가입버튼 활성화
    if (keyValidError || phoneValidError || passwordValidError || passwordError || passwordCheck === '' || company === '' || name === '' || !term){
      setDisableBtn(true);
    } else {
      setDisableBtn(false);
    }
  }, [keyValidError, phoneValidError, passwordCheck, passwordValidError, passwordError, name, company, term])

  const onChangeKey = useCallback( // 아이디 유효성검사
    (e) => {
      const regExpId = /^[A-Za-z0-9-@.]{4,25}$/;
      setKey(e.target.value);
      setKeyValidError(!regExpId.test(e.target.value));
    },
    [key],
  );

  const onChangePhone = useCallback( // 연락처 유효성검사
    (e) => {
      const { value } = e.target;
      const onlyNumber = value.replace(/[^0-9]/g, '');
      // const regExpPhone = /[^0-9]/;
      setPhone(onlyNumber);
      // setPhoneValidError(!regExpPhone.test(e.target.value));
    },
    [phone],
  );

  const onChangePassword = useCallback( // 비밀번호 유효성검사
    (e) => {
      const regExpPw = /^[A-Za-z0-9`~_!@#$%^&*()_+=,.></?-]{6,15}$/;
      setPassword(e.target.value);
      setPasswordValidError(!regExpPw.test(e.target.value));
    },
    [password],
  );

  const onChangePasswordCheck = useCallback(  // 비밀번호확인 검사
    (e) => {
      setPasswordCheck(e.target.value);
      setPasswordError(e.target.value !== password);
    },
    [passwordCheck],
  );


  const openNotification = (response) => {
    notification.open({
      message: `${response.company} 고객생성이 완료됐습니다.`,
      description:
        `${response.name}님, 아이디 ${response.key}`,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 8,
    });
  };

  
  const onCompletePost = (data) => {
    let fullAddr = data.address;
    let extraAddr = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddr += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddr += extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddr += extraAddr !== '' ? ` (${extraAddr})` : '';
    }

    setZip(data.zonecode);
    setAddress(fullAddr);
    setIsVisible(false);
  };

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    let fullAddress = '';
    let addrData = {};
    if (zip !== '') {
      if (address === '' || address2 === '') {
        return message.error('상세주소를 작성해주세요.')
      }
      fullAddress = address + ' ' + address2;
      addrData = { zip, address : fullAddress }
    }    
    setProviderKey(myUserInfo.key);
    // console.log(email, nickname, password);
    setLoading(true);
    createUserAPI({ providerKey: myUserInfo.key, role: 'CUSTOMER', key, password, company, name, phone, email, hqNumber, addrData })
      .then((response) => {
        openNotification(response);
        form.resetFields();
        setZip('');
        setAddress('');
        setAddress2('');
        setHqNumber('');
        setKey('');
        setCompany('');
        setName('');
        setPhone('');
        setEmail('');
        setPassword('123123');
        setPasswordCheck('123123');
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries('user'); // 카트 목록 다시 불러오기
        queryClient.invalidateQueries('userList');
      });
  }, [key, password, company, name, phone, email, passwordCheck, term, hqNumber]);

  return (
  <AppLayout>
    <Container500>
      <Head>
        <title>고객생성</title>
      </Head>
      <Title level={3}>고객 생성</Title>
      <Text>{myUserInfo.company}사의 고객 생성</Text>
      <Form onFinish={onSubmit} form={form}>
        <Block>
          <label><RedBold>* </RedBold>사업자등록번호 또는 ID</label>
          <input
            value={key}
            onChange={onChangeKey}
            placeholder=' - 포함하여 작성해주세요.'
            required
            autoComplete="off"
          />
        </Block>
        {keyValidError && <ErrorMessage>숫자, -, 영문(필요시)으로 4~25자 이내</ErrorMessage>}
        <Block>
          <label>본사 사업자등록번호</label>
          <input
            value={hqNumber}
            onChange={onChangeHq}
            placeholder='필요시만 입력'
            maxLength={25}
            autoComplete="off"
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>회사명 또는 성함</label>
          <input
            value={company}
            onChange={onChangeCompany}
            maxLength={12}
            placeholder='12자 이내'
            required
            autoComplete="off"
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>담당자 성함</label>
          <input
            value={name}
            onChange={onChangeName}
            maxLength={12}
            required
            autoComplete="off"
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>담당자 연락처</label>
          <input
            value={phone}
            onChange={onChangePhone}
            placeholder=' - 없이 숫자만 입력'
            maxLength={13}
            required
            autoComplete="off"
          />
        </Block>
        <Block>
          <label>담당자 이메일</label>
          <input
            type="email"
            value={email}
            onChange={onChangeEmail}
            autoComplete="off"
            autoCapitalize="no"
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>비밀번호</label>
          <input
            name="user-password"
            type="password"
            value={password}
            required
            onChange={onChangePassword}
            placeholder='6자 이상 15자 이하'
            autoComplete="no"
          />
        </Block>
        {passwordValidError && <ErrorMessage>6자 이상 15자 이하로 입력해 주세요.</ErrorMessage>}
        <Block>
          <label><RedBold>* </RedBold>비밀번호 확인</label>
          <input
            name="user-password-check"
            type="password"
            value={passwordCheck}
            required
            placeholder='6자 이상 15자 이하'
            onChange={onChangePasswordCheck}
            autoComplete="off"
          />
        </Block>
        <Block>
          <label>주소 입력 (필요시)</label>
        </Block>
        <Button type="primary" onClick={()=>setIsVisible(true)}>
            우편번호 찾기
          </Button>
        <Block>
          <label>우편번호</label>
          <input
            value={zip}
            placeholder='우편번호 찾기를 통해 입력해주세요.'
            readOnly
          />
        </Block>
        <Block>
          <label>주소</label>
          <input
            value={address}
            placeholder='우편번호 찾기를 통해 입력해주세요.'
            readOnly
          />
        </Block>
        <Block>
          <label>주소 상세</label>
          <input
            value={address2}
            onChange={onChangeAddress2}
            placeholder=''
          />
        </Block>
          {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
        <div>
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
            이용약관에 동의합니다.
          </Checkbox> <Link href='/user/term'><a target={'_blank'}><Tag>이용약관</Tag></a></Link>
          {termError && <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>}
        </div>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={disableBtn}>
            고객생성
          </Button>
        </div>
      </Form>
      <br/><br/>
    </Container500>
    {isVisible?
        <MoDal 
          ref={modalOutside}
          onClick={(e)=>{
            if(modalOutside.current === e.target) {
              setIsVisible(false)}
          }}
        >
          <div className='contents'>
            <DaumPostcode onComplete={onCompletePost } />
            <div className='close'>
              <Button onClick={() => { setIsVisible(false) }}>닫기</Button>
            </div>
          </div>
        </MoDal>
      :null}
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const key = context.params?.key as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  if (!response) { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 판매자권한
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};


export default CreateUser;
