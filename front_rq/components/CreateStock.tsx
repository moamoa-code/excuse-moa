import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, Divider, Typography, Tag, message } from 'antd';
import Router from 'next/router';
import { loadMyInfoAPI, signUpAPI } from '../apis/user';
import { Block, ContainerSmall, FormBox, Red } from '../components/Styled';
import { createInventoryAPI, createStockAPI } from '../apis/inventory';


// 재고 보고서 생성
const CreateStock = (props) => {
  const { user, setIsUpdated } = props;
  const [loading, setLoading] = useState(false);
  const { Title } = Typography;
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const onSubmit = () => {
    setLoading(true);
    setIsUpdated(false);
    const datas = {type, name, desc, userId: user.id};
    message.info(JSON.stringify(datas));
    createStockAPI(datas)
    .then((res) => {
      message.success(JSON.stringify(res));
    })
    .catch((error) => {
      message.error(JSON.stringify(error));
    })
    .finally(()=>{
      setIsUpdated(true);
    })
    return;
  }

  if (loading || !user) {
    return (
      <>
        데이터가 없거나 로드중입니다.
      </>
    );
  };

  return (
  <>
      <Head>
        <title>재고 품목 생성</title>
      </Head>
      <Divider><Title level={4}>재고 품목 생성</Title></Divider>
      <FormBox>
        <Form onFinish={onSubmit}>
          <Block>
            <label><Red>* </Red>카테고리/타입</label>
            <input
              value={type}
              onChange={
                (e)=>{
                  setType(e.target.value);
                }
              }
              placeholder=''
              maxLength={12}
              required
            />
          </Block>
          <Block>
            <label><Red>* </Red>제품 이름</label>
            <input
              value={name}
              onChange={
                (e)=>{
                  setName(e.target.value);
                }
              }
              placeholder=''
              maxLength={25}
              required
            />
          </Block>
          <Block>
            <label>제품 간단 설명</label>
            <input
              value={desc}
              onChange={
                (e)=>{
                  setDesc(e.target.value);
                }
              }
              placeholder=''
              maxLength={100}
            />
          </Block>
          <Block>
            <Button type="primary" htmlType="submit" loading={loading}>
              생성
            </Button>
          </Block>
        </Form>
      </FormBox>
  </>
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

export default CreateStock;
