// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Divider, Popconfirm } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';
import Router from 'next/router';

import { loadMyInfoAPI, createUserAPI, editUserAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';

const ErrorMessage = styled.div`
  color: red;
`;

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

const Container500 = styled.div`
  max-width: 500px;
  margin 0 auto;
  padding: 10px;
`

const RedBold = styled.span`
  color:red;
`

const EditUser = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI,{
    onSuccess(data) {
      setId(data.id);
      setCompany(data.company);
      setName(data.name);
      setPhone(data.phone);
      setEmail(data.email);
      setHqNum(data.hqNumber);
      console.log(myUserInfo);
    }
  });

  // const [id, onChangeId, setId] = useInput<string>('');
  // const [company, onChangeCompany, setCompany] = useInput<string>('');
  // const [name, onChangeName, setName] = useInput<string>('');
  // const [phone, onChangePhone, setPhone] = useInput<string>('');
  // const [email, onChangeEmail, setEmail] = useInput<string>('');
  // const [password, onChangePassword, setPassword] = useInput('');
  // const [hqNumber, onChangeHq, setHqNum] = useInput('');
  // const [passwordCheck, setPasswordCheck] = useState('');
  // const [passwordError, setPasswordError] = useState(false);
  // const onChangePasswordCheck = useCallback(
  //   (e) => {
  //     setPasswordCheck(e.target.value);
  //     setPasswordError(e.target.value !== password);
  //   },
  //   [password],
  // );

  const [id, setId] = useState('');
  const [company, onChangeCompany, setCompany] = useInput<string>('');
  const [name, onChangeName, setName] = useInput<string>('');
  const [phone, setPhone] = useState('');
  const [email, onChangeEmail, setEmail] = useInput<string>('');
  const [password, setPassword] = useState('');
  const [hqNumber, onChangeHq, setHqNum] = useInput<string>('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordValidError, setPasswordValidError] = useState(false);
  const [idValidError, setIdValidError] = useState(false);
  const [phoneValidError, setPhoneValidError] = useState(false);


  const onChangePhone = useCallback( // 연락처 유효성검사
    (e) => {
      const regExpPhone = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/;
      setPhone(e.target.value);
      setPhoneValidError(!regExpPhone.test(e.target.value));
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
      message: `회원정보 수정이 완료됐습니다.`,
      description:
        ``,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 4,
    });
  };

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    setLoading(true);
    editUserAPI({ id, password, company, name, phone, email, hqNumber })
      .then((response) => {
        openNotification(response);
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries('user');
        Router.replace('/');
      });
  }, [id, password, company, name, phone, email, passwordCheck]);

  return (
  <AppLayout>
    <Container500>
      <Head>
        <title>회원정보 수정</title>
      </Head>
      <Divider><Title level={4}>회원정보 수정</Title></Divider><br />
      {/* <Form
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        onFinish={onSubmit}>
        <Block>
          <label>사업자등록번호</label>
          <input
            value={id}
            disabled={true}
            onChange={onChangeId}
          />
        </Block>
        <Block>
          <label>본사 사업자등록번호</label>
          <input
            value={hqNumber}
            onChange={onChangeHq}
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>회사명</label>
          <input
            value={company}
            onChange={onChangeCompany}
            required
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>담당자 성함</label>
          <input
            value={name}
            onChange={onChangeName}
            required
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>담당자 연락처</label>
          <input
            value={phone}
            onChange={onChangePhone}
            required
          />
        </Block>
        <Block>
          <label>담당자 이메일</label>
          <input
            value={email}
            onChange={onChangeEmail}
            required
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>비밀번호</label>
          <Input.Password name="user-password" type="password" value={password} required onChange={onChangePassword} />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>비밀번호 확인</label>
          <Input.Password
            name="user-password-check"
            type="password"
            value={passwordCheck}
            required
            onChange={onChangePasswordCheck}
          />
        </Block>
          {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
        <div style={{ margin: '15px 0 30px 0'}}>
          <Button type="primary" htmlType="submit" loading={loading}>
            수정완료
          </Button>
        </div>
      </Form> */}


      <Form onFinish={onSubmit}>
        {/* <Block>
          <label><RedBold>* </RedBold>회원구분</label>
        </Block>  
          <input
            type='radio'
          />
          <span> 구매자 </span>
          <input
            type='radio'
          />
          <span> 판매자 </span> */}
          
        <Block>
          <label><RedBold>* </RedBold>사업자등록번호 (ID)</label>
          <input
            value={id}
            disabled={true}
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
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>회사명</label>
          <input
            value={company}
            onChange={onChangeCompany}
            maxLength={12}
            placeholder='12자 이내'
            required
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>담당자 성함</label>
          <input
            value={name}
            onChange={onChangeName}
            maxLength={12}
            required
          />
        </Block>
        <Block>
          <label><RedBold>* </RedBold>담당자 연락처</label>
          <input
            value={phone}
            onChange={onChangePhone}
            placeholder=' - 포함하여 작성'
            maxLength={13}
            required
          />
        </Block>
        {phoneValidError && <ErrorMessage> - 포함하여 작성해주세요.</ErrorMessage>}
        <Block>
          <label>담당자 이메일</label>
          <input
            type="email"
            value={email}
            onChange={onChangeEmail}
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
          />
        </Block>
          {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
        <div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            수정완료
          </Button>
          <Link href='/user/resign'><a>
            <Button danger loading={loading}>
            회원 탈퇴
            </Button></a>
          </Link>

          </Space>
        </div>

      </Form>
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
        destination: '/',
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


export default EditUser;
