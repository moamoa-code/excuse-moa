import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, Divider, Typography, Tag, message } from 'antd';
import { useQuery } from 'react-query';
import Router from 'next/router';
import { loadMyInfoAPI, signUpAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import { Block, ContainerSmall, FormBox, Red } from '../../components/Styled';
import { createInventoryAPI, createStockAPI } from '../../apis/inventory';
import CreateStock from '../../components/CreateStock';


// 재고 보고서 생성
const Create_Stock = () => {
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  
  return (
  <AppLayout>
    <ContainerSmall>
      <CreateStock user={myUserInfo} />
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

export default Create_Stock;
