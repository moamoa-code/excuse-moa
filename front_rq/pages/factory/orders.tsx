// @ts-nocheck
// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Typography, DatePicker, Button, Space, Divider, message } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI, loadProvidersAPI } from '../../apis/user';
import { loadMyOrdersAPI, loadAllOrdersWithDatesAPI } from '../../apis/order';
import AppLayout from '../../components/AppLayout';

import User from '../../interfaces/user';
import Order from '../../interfaces/order';

import moment from 'moment';
import 'moment/locale/ko';
import locale from 'antd/lib/locale/ko_KR';
import styled from 'styled-components';

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


const OptionContainer = styled.div`
  padding: 10px 0px 10px 0px;
  display: block;
  overflow:auto;
  max-height:300px;
  p {
    display: inline-block;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 5px 8px 5px 8px;
    margin: 6px;
    font-size: 10pt;
  }
  p:active {
    position: relative; 
    top:2px;
  }
  .codeName{
    background-color:#00B4D8;
    color: white;
  }
  .unit{
    background-color:#FF5C8D;
    color: white;
  }
  .package{
    background-color:#ec7728;
    color: white;
  }
  .provider{
    border: 1px solid #999999;
  }
`

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
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [ datesVal, setDatesVal ] = useState([moment().subtract(2, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);
  // const [ dates, setDates ] = useState(datesVal);
  const [ startDate, setStartDate ] = useState(moment().subtract(2, 'weeks'));
  const [ endDate, setEndDate ] = useState(moment());
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const getTotalPrice = (orders) => { // 총 금액 계산
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
    return String(total);
  };
  const { isLoading, data: orders } = useQuery<Order[]>(['orders', datesVal], 
    () => {
      const fromz = startDate.toDate();
      const tilz = endDate.toDate();
      const data = {from:fromz, til:tilz}
      return loadAllOrdersWithDatesAPI(data)
    }, {
      onSuccess: (data) => {
        getTotalPrice(data);
      }
    }
  ); // 데이터 불러오기, 총 금액 계산

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
      title: '판매사',
      dataIndex: 'Provider',
      key: 'date',
      render: (text, record) => (
        <>{text.company}</>
      ),
    }, {
      title: '출고상태',
      dataIndex: 'factoryStatus',
      key: 'factoryStatus',
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
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date)
  };

  return (
    <AppLayout>
      {/* {JSON.stringify(orders)} */}
      <Container800>
        {/* <Title level={4}>판매사 선택</Title>
          <OptionContainer>
            {providerList?.map((v)=>{
              return (
                <p className='provider'>{v.company}</p>
                ) 
            })}
          </OptionContainer><br /> */}
        <Title level={4}>주문서 목록</Title>
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
          />
      </Container800>
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
  if (response.role !== 'ADMINISTRATOR') { // 관리자 권한
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

export default OrderList;
