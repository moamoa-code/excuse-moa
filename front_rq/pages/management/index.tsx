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
import { Container800 } from '../../components/Styled';


const Management = () => {
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
        <Link href="/management/create-user"><a>고객생성</a></Link>
        <br />
        <Link href="/management/user-multi-create"><a>여러고객생성</a></Link>
        <br />
        <Link href="/management/customers"><a>고객관리 및 등록</a></Link>
        <br /><br />
        <Title level={4}><ShopOutlined /> 제품관리</Title>
        <Link href="/item/regist"><a>제품등록</a></Link>
        <br/>
        <Link href="/management/items"><a>제품목록</a></Link>
        <br /><br />
        <Title level={4}><UnorderedListOutlined /> 공지사항 관리</Title>
        <Link href="/post/regist"><a>공지사항 등록</a></Link>
        <br />
        <Link href="/management/posts"><a>공지사항 목록</a></Link>
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

export default Management;
