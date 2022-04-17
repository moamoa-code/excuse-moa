// 상품 등록 페이지
// 관리자, 판매자만 열람 가능
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Router from 'next/router';
import Link from 'next/link';

import React, { useCallback, useState, useRef } from 'react';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, List, Typography } from 'antd';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';

import { backUrl } from '../../config/config';

import { loadMyInfoAPI } from '../../apis/user';
import { registerItemAPI, uploadImageAPI } from '../../apis/item';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import Item from '../../interfaces/item';
import styled from 'styled-components';
import { ShopOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';

const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
`


const Factory = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);

  const { Title } = Typography;

  return (
    <AppLayout>
      <Head>
        <title>관리자페이지</title>
      </Head>
      <Container800>
        <Title level={4}><UserOutlined /> 고객관리</Title>
        <Link href="/factory/user/list"><a>회원목록 / 관리</a></Link>
        <br />
        <Link href="/factory/user/providers"><a>판매자-구매자 관리</a></Link>
        <br />
        <Link href="/factory/user/create"><a>회원생성</a></Link>
        <br />
        <Link href="/factory/user/multi-create"><a>여러 회원 생성</a></Link>
        <br /><br />
        <Title level={4}><ShopOutlined /> 제품관리</Title>
        <Link href="/factory/item/regist"><a>제품등록</a></Link>
        <br/>
        <Link href="/factory/item/list"><a>제품목록</a></Link>
        <br />
      </Container800>
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
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

export default Factory;