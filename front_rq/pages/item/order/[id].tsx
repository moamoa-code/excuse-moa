import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import { loadOrderAPI } from '../../../apis/order';
import AppLayout from '../../../components/AppLayout';
import OrderView from '../../../components/OrderView';
import User from '../../../interfaces/user';
import { Button, Input, notification, Popconfirm, Space, message as meSsage } from 'antd';
import { CheckCircleOutlined, PrinterTwoTone } from '@ant-design/icons';
import { requestCancelOrderAPI } from '../../../apis/order';
import useInput from '../../../hooks/useInput';
import Form from 'antd/lib/form/Form';
import Link from 'next/link';

// --주문서 상세 페이지--
const OrderConfirm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: orderId } = router.query; // 주문서 id
  const [ loading, setLoading ] = useState(false);
  const [ message, onChangeMessage ] = useInput('');
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: orderData } = useQuery(['orderData', orderId], () => loadOrderAPI(Number(orderId)));
  const [ mode, setMode ] = useState({ ship: true, price: true}); // 주문서보기 옵션
  
  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  const onRequestCancelOrder = () => {
    if (orderData.order?.factoryStatus === '출하') {
      setLoading(false);
      return meSsage.error('이미 출하 완료된 주문입니다. 판매자에 문의하세요')
    }
    setLoading(true);
    requestCancelOrderAPI({ orderId, message })
    .then(() => {
      queryClient.invalidateQueries('orderData');
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
      openNotification('주문취소가 완료되었습니다.')
    })
  }


  return (
    <AppLayout>
      <div style={{ maxWidth: '800px', padding: '10px', margin: '0 auto', position: 'relative' }}>
        {orderData.order.isCanceled? 
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.2)', position: 'absolute', borderRadius: '10px', zIndex: 2 }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '10px', borderRadius: '10px' }}>
              <h2>주문이 취소되었습니다.</h2>
              <h3>{orderData.order.message}</h3>
            </div>
          </div>
        : null}
        <OrderView orderData={orderData} mode={mode} />
      </div>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto', marginTop: '15px' }}>
        <Form>
          <Space size={8} wrap>
            {orderData.order.status === '주문요청'?
              <>
              <Input value={message} onChange={onChangeMessage} placeholder='배송사항/취소사유 등'></Input>
              <Popconfirm
                title="주문취소 요청하시겠습니까?"
                onConfirm={onRequestCancelOrder}
                okText="주문 취소 요청"
                cancelText="아니오"
              >
                <Button danger loading={loading}>
                  주문 취소요청
                </Button>
              </Popconfirm>
              </>
            : null}
            <Link href={`/item/order/view/${orderId}`}><a target="_blank"><Button 
              icon={<PrinterTwoTone />} ></Button></a>
            </Link>
          </Space>
        </Form>
      </div>
    </AppLayout>
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
  const orderData = await loadOrderAPI(Number(orderId))
  .catch((error) => {
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  })
  if (!response) { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  if (!orderData) {
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  if (orderData.order?.ProviderId !== response.id 
    && orderData.order?.CustomerId !== response.id
    && response.role !== 'ADMINISTRATOR'
    ){
    return {
      redirect: {
        destination: '/unauth',
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

export default OrderConfirm;
