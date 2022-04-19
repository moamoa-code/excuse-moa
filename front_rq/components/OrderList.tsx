// @ts-nocheck
// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Typography, DatePicker, Button, Space, Divider, message } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';

import moment from 'moment';
import 'moment/locale/ko';
import locale from 'antd/lib/locale/ko_KR';
import styled from 'styled-components';
import { loadMyOrdersAPI, loadOrderAPI, loadReceivedOrdersWithDatesAPI } from '../apis/order';
import { LoadingOutlined, PrinterTwoTone } from '@ant-design/icons';
import OrderView from './OrderView';

const ListTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);

  .msg {
    text-align: center;
    font-size: 12pt;
    font-wight: bold;
  }
  
  thead tr {
    background-color: #4D96FF;
    color: #ffffff;
    text-align: left;
  }
  th, td {
    padding: 12px 15px;
  }
  .styled-table tbody tr {
    border-bottom: 1px solid #dddddd;
  }
  tbody tr:nth-of-type(even) {
      background-color: #f3f3f3;
  }
  tbody tr:last-of-type {
      border-bottom: 2px solid #4D96FF;
  }
  tbody tr:hover{
    color: #4D96FF;
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

const OrderList = ({ userInfo, mode }) => {
  const LIST = 1;
  const ORDER = 2;
  const [ datesVal, setDatesVal ] = useState([moment().subtract(1, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);
  const [ startDate, setStartDate ] = useState(moment().subtract(1, 'months'));
  const [ endDate, setEndDate ] = useState(moment());
  const [ totalPrice, setTotalPrice ] = useState(0);
  const [ orderOrList, setOrderOrList ] = useState(LIST);
  const [ orderData, setOrderDate ] = useState(null);
  const queryClient = new QueryClient();
  const { isLoading, data: orders } = useQuery(['orders', startDate, endDate], 
    () => {
      if (mode === 'CUSTOMER') {
        return loadMyOrdersAPI(userInfo.id, [startDate, endDate]);
      } if (mode === 'PROVIDER') {
        return loadReceivedOrdersWithDatesAPI(userInfo.id, [startDate, endDate]);
      }
    }, {
      onSuccess: (data) => {
        console.log('onSuccess');
        getTotalPrice(data);
      }
    }
  );
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

  // 검색 날짜 조절
  const onChangeStartDate = (date) => {
    setStartDate(date);
  };
  const onChangeEndtDate = (date) => {
    setEndDate(date);
  };

  const onLoadOrdersWithDates = () => {
    if(!startDate || !endDate){
      message.error('날짜를 선택해 주세요.', 0.5);
      return;
    }
    queryClient.invalidateQueries();
  }

  // 주문서보기
  const showOrder = (id) => () => {
    loadOrderAPI(Number(id))
    .then((response) => {
      setOrderDate(response);
      setOrderOrList(ORDER);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
    })
  }
  // 리스트보기
  const showList = () => {
    setOrderOrList(LIST);
  }

  if (orderOrList === ORDER ) {
    return (
      <>
        <Button onClick={showList}>목록으로 돌아가기</Button>
        <OrderView orderData={orderData} mode={{ ship: true, price: true}}/><br />
        <Link href={`/item/order/view/${orderData?.order?.id}`}><a target="_blank"><Button 
          icon={<PrinterTwoTone />} ></Button></a>
        </Link>
      </>
    )
  }

  if (orderOrList === LIST) {
    if (mode === 'CUSTOMER') {
      return (
        <>
          <Space wrap>
            <Space>
              <span>시작:</span>
              <DatePicker
                onChange={onChangeStartDate}
                locale={pickerLocale}
                defaultValue={startDate}
                autocomplete="off"
              />
            </Space>
            <Space>
              <span>까지:</span>
            <DatePicker
              onChange={onChangeEndtDate} 
              locale={pickerLocale}
              defaultValue={endDate}
              autocomplete="off"
            />
            </Space>
            <br />
            <Button onClick={onLoadOrdersWithDates}>적용</Button>
          </Space><br /><br />
          <ListTable>
            <thead>
              <tr>
                <th>번호</th>
                <th>주문일시</th>
                <th>공급사</th>
                <th>공급가</th>
                <th>주문상태</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((v) => {
                return (
                <tr onClick={showOrder(v?.id)}>
                  <td>{v?.id}</td>
                  <td>{moment(v?.date).format('YY.MM.DD HH:mm')}</td>
                  <td>{v?.Provider?.company}</td>
                  <td>{v?.totalPrice}</td>
                  <td>{v?.status}</td>
                </tr>
                )
              })}
              {isLoading?
                <tr>
                  <td colSpan={5} className='msg'>
                    <LoadingOutlined style={{ fontSize: 24 }} spin />
                  </td>
                </tr>
              :null }
              {orders?.length <= 0? 
              <tr>
                <td colSpan={5} className='msg'>
                  데이터가 없습니다.
                </td>
              </tr>
              :null}
            </tbody>
          </ListTable>
          {totalPrice}
          {totalPrice === 0?
          null
          : <div>
            총 주문가격: {totalPrice}  
          </div>}
        </> 
      );
    } if (mode === 'PROVIDER') {
      return (
        <>
          <Space wrap>
            <Space>
              <span>시작:</span>
              <DatePicker
                onChange={onChangeStartDate}
                locale={pickerLocale}
                defaultValue={startDate}
                autocomplete="off"
              />
            </Space>
            <Space>
              <span>까지:</span>
            <DatePicker
              onChange={onChangeEndtDate} 
              locale={pickerLocale}
              defaultValue={endDate}
              autocomplete="off"
            />
            </Space>
            <br />
            <Button onClick={onLoadOrdersWithDates}>적용</Button>
          </Space><br /><br />
          <ListTable>
            <thead>
              <tr>
                <th>번호</th>
                <th>주문일시</th>
                <th>고객사</th>
                <th>공급가</th>
                <th>주문상태</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((v) => {
                return (
                <tr onClick={showOrder(v?.id)}>
                  <td>{v?.id}</td>
                  <td>{moment(v?.date).format('YY.MM.DD HH:mm')}</td>
                  <td>{v?.Customer?.company}</td>
                  <td>{v?.totalPrice}</td>
                  <td>{v?.status}</td>
                </tr>
                )
              })}
              {isLoading?
                <tr>
                  <td colSpan={5} className='msg'>
                    <LoadingOutlined style={{ fontSize: 24 }} spin />
                  </td>
                </tr>
              :null }
              {orders?.length <= 0? 
              <tr>
                <td colSpan={5} className='msg'>
                  데이터가 없습니다.
                </td>
              </tr>
              :null}
            </tbody>
          </ListTable>
          {totalPrice === 0?
          null
          : <div>
            총 주문가격: {totalPrice}  
          </div>}
        </> 
      );
    }
  }
  return (<>데이터가 없습니다.</>);
};

export default OrderList;
