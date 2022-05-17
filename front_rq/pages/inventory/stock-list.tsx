import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, Divider, Typography, Tag, message, Table } from 'antd';
import { useQuery } from 'react-query';
import Router from 'next/router';
import { loadMyInfoAPI, signUpAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import StockList from '../../components/StockList'
import { Block, Container800, ContainerSmall, FormBox, Red } from '../../components/Styled';
import { createInventoryAPI, getSotcksAPI } from '../../apis/inventory';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../components/MyTable';


// 재고 보고서 생성
const Stocks = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { Title } = Typography;
  const [ selectedStock, setSelectedStock ] = useState(null);

  return (
  <AppLayout>
    <Container800>
      <StockList user={myUserInfo} setSelectedStock={setSelectedStock}/><br />
      {JSON.stringify(selectedStock)}
    </Container800>
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
  console.log('쿠키 여부 response', response);
  // if (response) {
  //   return {
  //     redirect: {
  //       destination: '/',
  //       permanent: false,
  //     },
  //   };
  // }
  return {
    props: {},
  };
};

export default Stocks;
