import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, Divider, Typography, Tag, message } from 'antd';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import Router from 'next/router';
import { loadMyInfoAPI, signUpAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import { Block, ContainerSmall, FormBox, Red } from '../../components/Styled';


// 회원가입 페이지 
const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { Title } = Typography;
  useEffect(() => { // 로그인 됐을 경우 홈으로 이동
    if (myUserInfo) {
      Router.replace('/');
    }
  }, [myUserInfo]);

  const [key, setKey] = useState('');
  const [company, onChangeCompany] = useInput('');
  const [name, onChangeName] = useInput('');
  const [phone, setPhone] = useState('');
  const [email, onChangeEmail] = useInput('');
  const [password, setPassword] = useState('');
  const [hqNumber, onChangeHq] = useInput('');
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

  const onChangeKey = useCallback( // 아이디 유효성검사
    (e) => {
      const regExpId = /^[A-Za-z0-9-@.]{4,25}$/;
      setKey(e.target.value.replace(/[ㄱ-힣\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\")]/g, '').trim().toLowerCase());
      setIdValidError(!regExpId.test(e.target.value));
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

  const onSubmit = useCallback(() => {
    setLoading(true);
    if (password !== passwordCheck) {
      setLoading(false);
      return setPasswordError(true);
    }
    if (!term) {
      setLoading(false);
      return setTermError(true);
    }
    if (passwordValidError || idValidError || phoneValidError){
      message.error('폼을 알맞게 작성해 주세요.');
      setLoading(false);
      return;
    } else {
      const newKey = String(key).trim();
      signUpAPI({ key: newKey, password, company, name, phone, email, hqNumber })
      .then(() => {
        Router.replace('/');
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
    }
    // console.log(email, nickname, password);

  }, [key, password, company, name, phone, email, passwordCheck, term, hqNumber, passwordValidError, idValidError, phoneValidError]);

  return (
  <AppLayout>
    <ContainerSmall>
      <Head>
        <title>회원가입</title>
      </Head>
      <Divider><Title level={4}>회원가입</Title></Divider>
      <FormBox>
        <Form onFinish={onSubmit}>
          <Block>
            <label><Red>* </Red>사업자등록번호 (ID)</label>
            <input
              value={key}
              onChange={onChangeKey}
              placeholder=' - 포함하여 작성해주세요.'
              maxLength={25}
              required
            />
          </Block>
          {idValidError && <Red>숫자, -, 영문(필요시)으로 4~25자 이내</Red>}
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
            <label><Red>* </Red>비밀번호 (다른 서비스에서 사용하지 않는 유일한 비밀번호 권장)</label>
            <input
              name="user-password"
              type="password"
              value={password}
              required
              maxLength={15}
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
          <hr />
          <div>
            <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
              이용약관에 동의합니다.
            </Checkbox> <Link href='/user/term'><a target={'_blank'}><Tag>이용약관</Tag></a></Link>
            {termError && <Red>약관에 동의하셔야 합니다.</Red>}
          </div>
          <Block>
            <Button type="primary" htmlType="submit" loading={loading} disabled={disableBtn}>
              가입하기
            </Button>
          </Block>
        </Form>
      </FormBox>
    </ContainerSmall>
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const response = await loadMyInfoAPI();
  if (response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};

export default Signup;
