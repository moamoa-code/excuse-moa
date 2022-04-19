// @ts-nocheck
// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Typography, DatePicker, Button, Space, Divider, message } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../../apis/user';
import { loadMyOrdersAPI } from '../../../../apis/order';
import AppLayout from '../../../../components/AppLayout';

import User from '../../../../interfaces/user';
import Order from '../../../../interfaces/order';

import moment from 'moment';
import 'moment/locale/ko';
import locale from 'antd/lib/locale/ko_KR';
import styled from 'styled-components';

const PageSizer = styled.div`
  font-size: 11pt;
  span {
    margin-right: 5px;
  }
  input {
    text-align: center;
    box-sizing : border-box;
    width: 50px;
    border: 1px solid #999999;
    border-radius: 4px;
  }
`

const pickerLocale = { // antd DatePicker 로케일 설정
  "lang": {
    "locale": "ko_KR",
    "yearFormat": "YYYY",
    "dateFormat": "M/D/YYYY",
    "dayFormat": "D",
    "dateTimeFormat": "M/D/YYYY HH:mm:ss",
    "monthFormat": "MMMM",
  },
  "dateFormat": "YYYY-MM-DD",
  "dateTimeFormat": "YYYY-MM-DD HH:mm:ss",
  "weekFormat": "YYYY-wo",
  "monthFormat": "YYYY-MM"
}

const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

const OrderList = () => {
  const router = useRouter();
  const queryClient = new QueryClient();
  const { Title } = Typography;
  const { id: userId } = router.query; // 유저 id
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [ datesVal, setDatesVal ] = useState([moment().subtract(2, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);
  // const [ dates, setDates ] = useState(datesVal);
  const [ startDate, setStartDate ] = useState(moment().subtract(2, 'months'));
  const [ endDate, setEndDate ] = useState(moment());
  const [ totalPrice, setTotalPrice ] = useState(0);
  const [ pageSize, setPageSize ] = useState(10);
  const getTotalPrice = (orders) => { // 총 금액 계산
    console.log('getTotalPrice')
    let total = 0
    if(orders) {
      orders.map((v) => {
        let price = Number(v.totalPrice)?? 0;
        if (isNaN(price) || v.status.includes('주문취소')) {
          price = 0;
        }
        total = total + Number(price);
      })
    }
    setTotalPrice(total);
    return String(total);
  };
  const { isLoading, data: orders } = useQuery<Order[]>(['orders', datesVal], 
    () => {
      return loadMyOrdersAPI(userId, datesVal)
    }, {
      onSuccess: (data) => {
        console.log('onSuccess');
        getTotalPrice(data);
      }
    }
  ); // 데이터 불러오기, 총 금액 계산

  const onChangePageSize = (e) => {
    if (e.target.value >= 100) {
      return setPageSize(100);
    }
    return setPageSize(e.target.value);
  }

  const onLoadOrdersWithDates = () => {
    if(!startDate || !endDate){
      message.error('날짜를 선택해 주세요.', 0.5);
      return;
    }
    // if(!endDate.isAfter(startDate)){
    //   message.error('시작날짜와 끝나는 날짜를 확인해 주세요.', 0.5);
    //   return;
    // }
    const newDates = [moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')];
    console.log(newDates);
    setDatesVal(newDates);
    // queryClient.fetchQuery(['orders', datesVal], () => loadMyOrdersAPI(orderId, datesVal));
    queryClient.invalidateQueries('orders');
  }

  const columns = [
    {
      title: '주문일시',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <>{moment(text).format('YYYY.MM.DD HH:mm')}</>
      ),
    }, {
      title: '주문번호',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: '총 공급가',
      key: 'totalPrice',
      dataIndex: 'totalPrice',
    }, {
      title: '공급사',
      dataIndex: 'Provider',
      key: 'date',
      render: (text, record) => (
        <>{text.company}</>
      ),
    }, {
      title: '주문상태',
      dataIndex: 'status',
      key: 'status',
    },{
      title: '',
      key: 'action',
      render: (text, record) => (
        <Link href={`/item/order/${record.id}`}><a>자세히 보기</a></Link>
      ),
    }
  ]

  const onChangeStartDate = (date, dateString) => {
    setStartDate(date)
    console.log(startDate)
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date)
    console.log(endDate)
  };

  return (
    <AppLayout>
      {/* {JSON.stringify(orders)} */}
      <Container800>
        <Title level={4}>주문 목록</Title>
        <Space wrap>
          <Space>
            <span>시작:</span>
            <DatePicker
              onChange={onChangeStartDate}
              locale={pickerLocale}
              defaultValue={startDate}
            />
          </Space>
          <Space>
            <span>까지:</span>
          <DatePicker
            onChange={onChangeEndtDate} 
            locale={pickerLocale}
            defaultValue={endDate}
          />
          </Space>
          <br />
          <span>기간 검색</span>
          <Button onClick={onLoadOrdersWithDates}>적용</Button>
        </Space>
        <p></p>
        <Table 
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          pagination={{pageSize:pageSize}}
          />
        <PageSizer>
          <span>페이지크기</span>
          <input 
            type='number'
            max={100}
            maxLength={3}
            value={pageSize}
            onChange={onChangePageSize}
          />
        </PageSizer>
        {totalPrice?
        <Divider orientation="right">완료된 주문 총 금액: {String(totalPrice).toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") ?? ''} 원</Divider>
        : null}
      </Container800>
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const id = context.params?.id as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const datesVal = [moment().subtract(2, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
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
  await queryClient.prefetchQuery(['orders', datesVal], () => loadMyOrdersAPI(id, datesVal));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default OrderList;
