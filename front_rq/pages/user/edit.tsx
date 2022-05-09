// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Divider, Popconfirm, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';
import Router from 'next/router';

import { loadMyInfoAPI, createUserAPI, editMyInfoAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import { Block, ContainerMid, FormBox, Red } from '../../components/Styled';

const EditUser = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI,{
    // onSuccess(data) {
    //   setKey(data.key);
    //   setCompany(data.company);
    //   setName(data.name);
    //   setPhone(data.phone);
    //   setEmail(data.email);
    //   setHqNum(data.hqNumber);
    // }
  });

  const [key, setKey] = useState<string>('');
  const [company, onChangeCompany, setCompany] = useInput<string>('');
  const [name, onChangeName, setName] = useInput<string>('');
  const [phone, setPhone] = useState('');
  const [email, onChangeEmail, setEmail] = useInput<string>('');
  const [password, setPassword] = useState('');
  const [hqNumber, onChangeHq, setHqNum] = useInput<string>('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordValidError, setPasswordValidError] = useState(false);
  const [keyValidError, setKeyValidError] = useState(false);
  const [disableBtn, setDisableBtn] = useState(true);

  const setUserData = (user) => {
    setKey(user.key);
    setCompany(user.company);
    setName(user.name);
    setPhone(user.phone);
    setEmail(user.email);
    setHqNum(user.hqNumber);
  }

  useEffect(() => {
    if(myUserInfo.id) {
      setUserData(myUserInfo);
    }
  }, [myUserInfo])


  useEffect(() => { // 유효성 검사완료시 가입버튼 활성화
    if (keyValidError || passwordValidError || passwordError || passwordCheck === '' || company === '' || name === ''){
      setDisableBtn(true);
    } else {
      setDisableBtn(false);
    }
  }, [keyValidError, passwordCheck, passwordValidError, passwordError, name, company])


  const onChangeKey = useCallback( // 아이디 유효성검사
  (e) => {
    const regExpId = /^[A-Za-z0-9-@.]{1,25}$/;
    setKey(e.target.value.replace(/[ㄱ-힣\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\")]/g, '').trim().toLowerCase());
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
  
  const onSubmit = useCallback(() => {
    if (keyValidError) {
      return message.error('아이디를 올바르게 입력해주세요.')
    }
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    setLoading(true);
    editMyInfoAPI({ key, password, company, name, phone, email, hqNumber })
      .then((response) => {
        message.success('회원정보 수정 완료');
        queryClient.invalidateQueries('user');
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        Router.replace('/');
        setLoading(false);
      });
  }, [key, password, company, name, phone, email, passwordCheck]);

  return (
  <AppLayout>
    <ContainerMid>
      <Head>
        <title>회원정보 수정</title>
      </Head>
      <Divider><Title level={4}>회원정보 수정</Title></Divider>
      <FormBox>
        <Form onFinish={onSubmit}>
          <Block>
            <label><Red>* </Red>사업자등록번호 (아이디)</label>
            <input
              onChange={onChangeKey}
              value={key}
            />
          </Block>
          {keyValidError && <Red>숫자, -, 영문(필요시)으로 4~25자 이내</Red>}
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
            <label><Red>* </Red>회사명</label>
            <input
              value={company}
              onChange={onChangeCompany}
              maxLength={12}
              placeholder='12자 이내'
              required
            />
          </Block>
          <Block>
            <label><Red>* </Red>담당자 성함</label>
            <input
              value={name}
              onChange={onChangeName}
              maxLength={12}
              required
            />
          </Block>
          <Block>
            <label><Red>* </Red>담당자 연락처</label>
            <input
              value={phone}
              onChange={onChangePhone}
              placeholder=' - 없이 숫자만 입력'
              maxLength={13}
              required
            />
          </Block>
          <Block>
            <label>담당자 이메일</label>
            <input
              type="email"
              value={email}
              maxLength={30}
              onChange={onChangeEmail}
            />
          </Block>
          <Block>
            <label><Red>* </Red>비밀번호</label>
            <input
              name="user-password"
              type="password"
              value={password}
              required
              onChange={onChangePassword}
              placeholder='6자 이상 15자 이하'
            />
          </Block>
          {passwordValidError && <Red>6자 이상 15자 이하로 입력해 주세요.</Red>}
          <Block>
            <label><Red>* </Red>비밀번호 확인</label>
            <input
              name="user-password-check"
              type="password"
              value={passwordCheck}
              required
              placeholder='6자 이상 15자 이하'
              onChange={onChangePasswordCheck}
            />
          </Block>
            {passwordError && <Red>비밀번호가 일치하지 않습니다.</Red>}
          <div>
          </div>
          <hr />
            <Block>
              <Button type="primary" htmlType="submit" loading={loading} disabled={disableBtn}>
                수정완료
              </Button>
              <Link href='/user/resign'><a>
                <Button danger loading={loading}>
                회원 탈퇴
                </Button></a>
              </Link>
            </Block>
        </Form>
      </FormBox>
    </ContainerMid>
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
