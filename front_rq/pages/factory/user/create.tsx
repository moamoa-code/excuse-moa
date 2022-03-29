// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useCallback, useState, useEffect } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Select, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';

import { loadMyInfoAPI, createUserAPI, loadUserAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import useInput from '../../../hooks/useInput';
import User from '../../../interfaces/user';

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

const CreateUser = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [providerId, setProviderId] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [form] = Form.useForm();
  const { Search } = Input;
  const { Option } = Select;
  const [id, setId] = useState('');
  const [role, setRole] = useState('PROVIDER');
  const [company, onChangeCompany, setCompany] = useInput('');
  const [name, onChangeName, setName] = useInput('');
  const [phone, setPhone] = useState('');
  const [email, onChangeEmail, setEmail] = useInput('');
  const [password, setPassword] = useState('');
  const [hqNumber, onChangeHq, setHqNumber] = useInput('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordValidError, setPasswordValidError] = useState(false);
  const [idValidError, setIdValidError] = useState(false);
  const [phoneValidError, setPhoneValidError] = useState(false);
  const [disableBtn, setDisableBtn] = useState(true);
  const [term, setTerm] = useState(false);
  const [termError, setTermError] = useState(false);
  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    setTermError(false);
  }, []);

  useEffect(() => { // 유효성 검사완료시 가입버튼 활성화
    if (idValidError || phoneValidError || passwordValidError || passwordError || passwordCheck === '' || company === '' || name === '' || !term){
      setDisableBtn(true);
    } else {
      setDisableBtn(false);
    }
  }, [idValidError, phoneValidError, passwordCheck, passwordValidError, passwordError, name, company, term])

  const onChangeId = useCallback( // 아이디 유효성검사
    (e) => {
      const regExpId = /^[A-Za-z0-9-@.]{4,25}$/;
      setId(e.target.value);
      setIdValidError(!regExpId.test(e.target.value));
    },
    [id],
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

  const handleRoleChange = (value) => {
    setRole(value);
  }


  const openNotification = (response) => {
    notification.open({
      message: `${response.company} 고객생성이 완료됐습니다.`,
      description:
        `${response.name}님, 아이디 ${response.id}`,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 8,
    });
  };

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    setProviderId(myUserInfo.id);
    // console.log(email, nickname, password);
    setLoading(true);
    createUserAPI({ providerId: selectedProviderId, role, id, password, company, name, phone, email, hqNumber })
      .then((response) => {
        openNotification(response);
        setHqNumber('');
        setRole('PROVIDER');
        setId('');
        setCompany('');
        setName('');
        setPhone('');
        setEmail('');
        setPassword('');
        setProviderId('');
        setSelectedProviderId('');
        setPasswordCheck('');
        form.resetFields();
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries('user'); // 카트 목록 다시 불러오기
      });
  }, [id, role, selectedProviderId, password, company, name, phone, email, passwordCheck, term, hqNumber]);

  
  const onSearch = (value) => {
    console.log(value);
    setLoading(true);
    loadUserAPI(String(value))
      .then((response) => {
        message.success('판매사 ' + response.company + '선택완료');
        setSelectedProviderId(response.id);
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
  <AppLayout>
    <Container500>
      <Head>
        <title>회원 생성</title>
      </Head>
      <Title level={3}>회원 생성</Title>
      <Form onFinish={onSubmit} form={form}>
        <Block>
          <label><RedBold>* </RedBold>회원 구분</label>
          <Select
            onChange={handleRoleChange}
            defaultValue={role}
          >
            <Option value='PROVIDER'>판매자</Option>
            <Option value='CUSTOMER'>구매자</Option>
            <Option value='NOVICE'>비회원</Option>
          </Select>
        </Block>
        {role === 'CUSTOMER'?
        <Block>
          <label>판매자 선택</label>
          <Search placeholder="ID / 사업자 등록번호" onSearch={onSearch} enterButton/><br />
          <div><b>선택된 판매자: {selectedProviderId}</b></div>
        </Block>  
        : null}
        <Block>
          <label><RedBold>* </RedBold>사업자등록번호 또는 ID</label>
          <input
            value={id}
            onChange={onChangeId}
            placeholder=' - 포함하여 작성해주세요.'
            required
            autoComplete="off"
          />
        </Block>
        {idValidError && <ErrorMessage>숫자, -, 영문(필요시)으로 4~25자 이내</ErrorMessage>}
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
          {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
        <div>
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
            이용약관에 동의합니다.
          </Checkbox> <Link href='/user/term'><a target={'_blank'}><Tag>이용약관</Tag></a></Link>
          {termError && <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>}
        </div>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={disableBtn}>
            회원생성
          </Button>
        </div>
      </Form>
      <br/><br/>
    </Container500>
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const id = context.params?.id as string;
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
