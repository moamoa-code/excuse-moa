import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, Divider, Typography, Tag, message, Popconfirm } from 'antd';
import { useQuery } from 'react-query';
import Router from 'next/router';
import { loadMyInfoAPI, signUpAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import { Block, Container800, ContainerSmall, FormBox, HGap, Red } from '../../components/Styled';
import { getInventoriesAPI, getInventoryGroupsAPI, onDeleteInventoryGroupAPI } from '../../apis/inventory';
import dayjs from 'dayjs';
import MyTable from '../../components/MyTable';


// 재고
const CreateInventory = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { Title } = Typography;
  const [ inventoryGroups, setInventoryGroups ] = useState(null);

  const getInventoryGroups = (user) => {
    setLoading(true);
    const userId = Number(user.id)
    getInventoryGroupsAPI(userId)
    .then((res) => {
      setInventoryGroups(res);
    })
    .catch((error) => {
      message.error(JSON.stringify(error));
    })
    .finally(()=>{
      setLoading(false);
    })
  }

  const onDeleteInventoryGroup = (id) => () => {
    const data = { id: id }
    onDeleteInventoryGroupAPI(data)
    .then((res) => {
      message.success('보고서그룹을 삭제했습니다.')
      getInventoryGroups(myUserInfo);
    })
    .catch((error) => {
      message.error(JSON.stringify(error));
    })
    .finally(()=>{
      setLoading(false);
    })
  }

  useEffect(() => { // 로그인시 데이터 가져오기.
    if (myUserInfo) {
      getInventoryGroups(myUserInfo);
    } 
  }, [myUserInfo]);
  
  const columns = [
    {
      title: '제목',
      dataIndex: 'name',
      type: 'title',
      key: 'name',
    }, {
      title: '마지막 업데이트',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text, record) => (
        <>{dayjs(text).format('YY.MM.DD HH:mm')}</>
      )
    }, {
      title: '',
      key: 'action',
      type: 'right',
      render: (text, record) => (
        <Link href={`/inventory/report/${record.id}`}>
          <Button type='primary' loading={loading} onClick={(e)=>e.stopPropagation()}>재고조사</Button>
        </Link>
      )
    },
  ]

  const expandable = {
    expandedRowRender: (record) => 
    <div>
      {record.desc}<HGap />
      <Popconfirm
        title="삭제처리 하시겠습니까?"
        onConfirm={onDeleteInventoryGroup(record.id)}
        okText="삭제"
        cancelText="취소"
      >
        <Button loading={loading} danger>삭제</Button>
      </Popconfirm>
    </div>,
  };
  
  return (
  <AppLayout>
    <Container800>
      <Title level={4}>재고보고서 관리</Title>
      <MyTable
        columns={columns}
        dataSource={inventoryGroups}
        expandable={expandable}
        rowKey='id'
      />
      {/* {JSON.stringify(inventoryGroups)} */}
      <HGap />
      <Link href={`/inventory/create-group`}><Button type='primary' loading={loading}>+ 새로운 재고 그룹 생성</Button></Link>
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

export default CreateInventory;
