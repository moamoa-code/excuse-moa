// @ts-nocheck
// -> locale 타입 문제
// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Table, Typography, Input, Button, Tag, Checkbox, Divider, Space, DatePicker, message } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import { loadReceivedOrdersWithDatesAPI } from '../../../apis/order';
import AppLayout from '../../../components/AppLayout';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
// @ts-nocheck
import User from '../../../interfaces/user';
import Order from '../../../interfaces/order';
import styled from 'styled-components';
import moment from 'moment';

const pickerLocale = {
  "lang": {
    "locale": "ko_KR",
    "placeholder": "Select date",
    "rangePlaceholder": ["Start date", "End date"],
    "today": "Today",
    "now": "Now",
    "backToToday": "Back to today",
    "ok": "OK",
    "clear": "Clear",
    "month": "Month",
    "year": "Year",
    "timeSelect": "Select time",
    "dateSelect": "Select date",
    "monthSelect": "Choose a month",
    "yearSelect": "Choose a year",
    "decadeSelect": "Choose a decade",
    "yearFormat": "YYYY",
    "dateFormat": "M/D/YYYY",
    "dayFormat": "D",
    "dateTimeFormat": "M/D/YYYY HH:mm:ss",
    "monthFormat": "MMMM",
    "monthBeforeYear": true,
    "previousMonth": "Previous month (PageUp)",
    "nextMonth": "Next month (PageDown)",
    "previousYear": "Last year (Control + left)",
    "nextYear": "Next year (Control + right)",
    "previousDecade": "Last decade",
    "nextDecade": "Next decade",
    "previousCentury": "Last century",
    "nextCentury": "Next century"
  },
  "timePickerLocale": {
    "placeholder": "Select time"
  },
  "dateFormat": "YYYY-MM-DD",
  "dateTimeFormat": "YYYY-MM-DD HH:mm:ss",
  "weekFormat": "YYYY-wo",
  "monthFormat": "YYYY-MM"
}

// const pickerLocale = { // antd DatePicker 로케일 설정
//   "lang": {
//     "locale": "ko_KR",
//     "yearFormat": "YYYY",
//     "dateFormat": "M/D/YYYY",
//     "dayFormat": "D",
//     "dateTimeFormat": "M/D/YYYY HH:mm:ss",
//     "monthFormat": "MMMM",
//   },
//   "dateFormat": "YYYY-MM-DD",
//   "dateTimeFormat": "YYYY-MM-DD HH:mm:ss",
//   "weekFormat": "YYYY-wo",
//   "monthFormat": "YYYY-MM"
// }
const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

const Orders = () => {
  const router = useRouter();
  const queryClient = new QueryClient();
  const { Title } = Typography;
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [ id, setId ] = useState(myUserInfo.id);
  const [ totalPrice, setTotalPrice ] = useState(0);
  const [ datesVal, setDatesVal ] = useState([moment().subtract(2, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);
  const [ startDate, setStartDate ] = useState(moment().subtract(2, 'months'));
  const [ endDate, setEndDate ] = useState(moment());
  // const { data: orders } = useQuery<Order[]>(['orders', id, datesVal], () => loadReceivedOrdersAPI(String(id), null, datesVal));
  const getTotalPrice = (orders) => { // 총 금액 계산
    console.log('getTotalPrice')
    let total = 0
    if(orders) {
      orders.map((v) => {
        let price = Number(v.totalPrice)?? 0;
        if (isNaN(price) || v.status !== '주문확인완료') {
          price = 0;
        }
        total = total + Number(price);
      })
    }
    setTotalPrice(total);
    console.log(total);
    return String(total);
  };
  const { isLoading, data: orders } = useQuery<Order[]>(['orders', datesVal], 
    () => {
      return loadReceivedOrdersWithDatesAPI(String(id), datesVal)
    }, {
      onSuccess: (data) => {
        console.log('onSuccess');
        getTotalPrice(data);
      }
    }
  ); // 데이터 불러오기, 총 금액 계산


  const onChangeStartDate = (date, dateString) => {
    setStartDate(date)
    console.log(startDate)
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date)
    console.log(endDate)
  };

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
        <>{dayjs(text).format('YYYY.MM.DD HH:mm')}</>
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
      title: '고객사',
      dataIndex: 'Customer',
      key: 'date',
      render: (text, record) => (
        <>{text.company}</>
      ),
    }, {
      title: '주문상태',
      dataIndex: 'status',
      key: 'status',
    }, {
      title: '',
      key: 'action',
      render: (text, record) => (
        <Link href={`/management/check-order/${record.id}`}><a>주문상세</a></Link>
      ),
    }
  ]

  return (
    <AppLayout>
      <Container800>
        {/* <p>{JSON.stringify(orders)}</p> */}
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
          />
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

export default Orders;
