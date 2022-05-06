// 판매자의 제품 리스트
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button, Table, Typography } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../apis/user';
import { loadMyItemsAPI } from '../../apis/item';
import AppLayout from '../../components/AppLayout';
import ItemList from '../../components/ItemList'; // 제품 상세정보 보기 컴포넌트
import User from '../../interfaces/user';
import Item from '../../interfaces/item';
import styled from 'styled-components';
import ItemView from '../../components/ItemView';
import { DownOutlined, RightOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../components/MyTable';
import { ContainerBig } from '../../components/Styled';

const ProvidersItemList = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: items } = useQuery(['items'], loadMyItemsAPI);
  const { Title } = Typography;
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const columns = [
    {
      title: '번호',
      dataIndex: 'id',
      type: 'id',
      key: 'id',
      render: (text, record) => (
        <>{text}</>
      ),
    }, {
      title: '제품명',
      dataIndex: 'name',
      type: 'title',
      key: 'name',
      render: (text, record) => (
        <>{text}</>
      ),
    }, {
      title: '포장종류',
      dataIndex: 'packageName',
      key: 'packageName',
    }, {
      title: '공급가',
      key: 'supplyPrice',
      type: 'right',
      dataIndex: 'supplyPrice',
      render: (text, record) => (
        <>{text.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}원</>
      ),
    }, {
      title: '무게단위',
      dataIndex: 'unit',
      type: 'right',
      key: 'unit',
    }, {
      title: '열람',
      key: 'scope',
      dataIndex: 'scope',
      render: (text, record) => (
        <>
          {text === 'PRIVATE'?
            <span>전용</span>
          : text === 'GROUP'?
            <span>공개</span>
          : null}
        </>
      ),
      filters: [
        {
          text: '전용',
          value: 'PRIVATE'
        }, {
          text: '공개',
          value: 'GROUP'
        }
      ],
      onFilter: (value, record) => record.role?.indexOf(value) === 0,
    },
  ];

  const expandable = {
    expandRowByClick: true,
    expandedRowRender: (record) => 
    <div style={{margin: '15px'}}>
      <ItemView item={record} myUserInfo={myUserInfo} />
    </div>,
    columnWidth: 20,
    expandIcon: ({ expanded, onExpand, record }) =>
    expanded ? (
      <DownOutlined style={{color: '#64707a', fontSize: '8pt', margin: '0px'}} onClick={e => onExpand(record, e)} />
    ) : (
      <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
    )
  };

  return (
    <AppLayout>
      <ContainerBig>
        <Title level={4}>제품목록</Title>
        {/* <p>{JSON.stringify(items)}</p> */}
        {isMobile?
        <MyTable
          size="small"
          rowKey="id"
          columns={columns}
          expandable={expandable}
          dataSource={items}
        />
        :
        <Table
          rowKey="id"
          columns={columns}
          expandable={expandable}
          dataSource={items}
        />
        }

        <Link href='/item/regist'><a><Button type='primary'> + 새로운 제품 추가</Button></a></Link>
      </ContainerBig>
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
  await queryClient.prefetchQuery(['items'], () => loadMyItemsAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ProvidersItemList;
