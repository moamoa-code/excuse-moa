// 주문확인서 인쇄
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../../apis/user';
import { loadOrderAPI } from '../../../../apis/order';
import AppLayout from '../../../../components/AppLayout';
import OrderView from '../../../../components/OrderView';
import User from '../../../../interfaces/user';
import { Button, Input, notification, Popconfirm, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { requestCancelOrderAPI } from '../../../../apis/order';
import useInput from '../../../../hooks/useInput';
import Form from 'antd/lib/form/Form';
import styled from 'styled-components';
import ReactToPrint from "react-to-print";


const A4style = styled.div`
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 0cm auto;
  border-radius: 5px;
  background: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
`;

const PrintOrder = () => {
  const router = useRouter();
  const { id: orderId } = router.query; // 주문서 id
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: orderData } = useQuery(['orderData', orderId], () => loadOrderAPI(Number(orderId)));
  const componentRef = useRef(null);
  const [ mode, setMode ] = useState({ ship: true, price: true}); // 주문서보기 옵션

  const onToggleShip = () => {
    if (mode.ship) {
      setMode({
        ...mode,
        ship:false,
      })
    } else {
      setMode({
        ...mode,
        ship:true,
      })
    }
  }

  const onTogglePrice = () => {
    if (mode.price) {
      setMode({
        ...mode,
        price:false,
      })
    } else {
      setMode({
        ...mode,
        price:true,
      })
    }
  }


  return (
    <>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
      <Space>
        <ReactToPrint
          trigger={() => <Button type="primary">인쇄하기</Button>}
          content={() => componentRef.current}
        />
        <Button onClick={onToggleShip}>배송지 숨기기/보이기</Button>
        <Button onClick={onTogglePrice}>금액 숨기기/보이기</Button>
      </Space>
    </div>
    <A4style ref={componentRef}>
        <OrderView orderData={orderData} mode={mode} />
      </A4style>
    </>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const orderId = context.params?.id as string;
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
  await queryClient.prefetchQuery(['orderData', orderId], () => loadOrderAPI(Number(orderId)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default PrintOrder;
