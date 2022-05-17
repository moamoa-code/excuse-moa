import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, Divider, Typography, Tag, message, Space } from 'antd';
import { useQuery } from 'react-query';
import Router, { useRouter } from 'next/router';
import { loadMyInfoAPI, signUpAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import { Block, ContainerSmall, FormBox, Red } from '../../components/Styled';
import { createInventoryGroupAPI } from '../../apis/inventory';


// 재고 보고서 그룹 생성
const CreateInventoryGroup = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { Title } = Typography;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const onSubmit = () => {
    const datas = {name, desc};
    createInventoryGroupAPI(datas)
    .then((res) => {
      message.success('보고서그룹이 생성됐습니다.');
      router.replace(`/inventory`);
    })
    .catch((error) => {
      message.error(JSON.stringify(error));
    })
    return;
  }

  return (
  <AppLayout>
    <ContainerSmall>
      <Head>
        <title>재고 보고서 그룹 생성</title>
      </Head>
      <Divider><Title level={4}>재고 보고서 그룹 생성</Title></Divider>
      <FormBox>
        <Form onFinish={onSubmit}>
          <Block>
            <label><Red>* </Red>재고 보고서 이름</label>
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
            <label>재고 보고서 간단 설명</label>
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
            <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              생성
            </Button>
            <Link href={`/inventory/`}><Button>목록으로</Button></Link>
            </Space>

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

export default CreateInventoryGroup;
