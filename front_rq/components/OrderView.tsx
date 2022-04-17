// 주문확인서 컴포넌트
import React, { useEffect } from 'react';
import { Descriptions, Divider, Table, Typography, Space, Button } from 'antd';
import { PhoneOutlined, PrinterTwoTone } from '@ant-design/icons';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Link from 'next/link';


const OrderView = ({ orderData, mode }) => {
  const { Title } = Typography;

  const columns = [
    {
      title: '제품명',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text, record) => (
        <>{text}</>
      ),
    },
    {
      title: '포장종류',
      dataIndex: 'itemPackage',
      key: 'itemPackage',
    },{
      title: '표기사항',
      key: 'tag',
      dataIndex: 'tag'
    },
    {
      title: '단위',
      dataIndex: 'itemUnit',
      key: 'itemUnit',
    },
    {
      title: '공급단가',
      key: 'itemSupplyPrice',
      dataIndex: 'itemSupplyPrice',
      render: (text,record) => (
        <>{text?.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
        </>
      )
    }, 
    {
      title: '수량',
      dataIndex: 'qty',
      key: 'action',
    },
  ]

  const columnsWithoutPrice = [
    {
      title: '제품명',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text, record) => (
        <>{text}</>
      ),
    },
    {
      title: '포장종류',
      dataIndex: 'itemPackage',
      key: 'itemPackage',
    },{
      title: '표기사항',
      key: 'tag',
      dataIndex: 'tag'
    },
    {
      title: '단위',
      dataIndex: 'itemUnit',
      key: 'itemUnit',
    },
    {
      title: '수량',
      dataIndex: 'qty',
      key: 'action',
    },
  ]

  return (
  <>
      {/* {JSON.stringify(orderData)} */}
    <Divider orientation="center"><Title level={4}>주문확인서</Title></Divider>
    <Descriptions size="small" bordered>
      <Descriptions.Item label="주문일시">
        {dayjs(orderData.order.date).format('YYYY.MM.DD HH:mm')}
      </Descriptions.Item>
      <Descriptions.Item label="주문번호">
        {orderData.order.id}
      </Descriptions.Item>
      <Descriptions.Item label="상태">
        {orderData.order.factoryStatus === '출하'?
          <span>출하완료</span>
        : <span>{orderData.order.status}</span>}
        {orderData.order.message? 
          <> / {orderData.order.message}</>
        : null}
      </Descriptions.Item>
    </Descriptions>
    <br />
    <Descriptions size="small" title="공급사" bordered>
      <Descriptions.Item label="사명">
        {orderData.order.Provider?.company}
      </Descriptions.Item>
      <Descriptions.Item label="사업자등록번호">
        {orderData.order.Provider.key}
      </Descriptions.Item>
      <Descriptions.Item label="담당자">
        {orderData.order.Provider.name} <PhoneOutlined /> {orderData.order.Provider.phone}
      </Descriptions.Item>
    </Descriptions>
    <br />
    <Descriptions size="small" title="고객사" bordered>
      <Descriptions.Item label="사명">
        {orderData.order.Customer?.company}
      </Descriptions.Item>
      <Descriptions.Item label="사업자등록번호">
      {orderData.order.Customer?.key}
      </Descriptions.Item>
      <Descriptions.Item label="담당자">
        {orderData.order.Customer?.name} <PhoneOutlined /> {orderData.order.Customer?.phone}
      </Descriptions.Item>
    </Descriptions>
    <br />
    {mode.ship? 
      <>
        <Descriptions size="small" title="배송지" bordered>
          <Descriptions.Item label="주소">
            {orderData.order?.address}
          </Descriptions.Item>
          <Descriptions.Item label="받는분">
            {orderData.order?.name}
          </Descriptions.Item>
          <Descriptions.Item label="전화번호">
            {orderData.order?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="요구사항" span={3}>
            {orderData.order?.comment}
          </Descriptions.Item>
        </Descriptions>
        <br />
      </>
    : null }

    <Title level={5}>주문 품목</Title>
    {mode.price?
      <Table 
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={orderData.orderDetails}
        pagination={false}
      />
    : <Table 
        size="small"
        rowKey="id"
        columns={columnsWithoutPrice}
        dataSource={orderData.orderDetails}
        pagination={false}
    />}
    {mode.price?
      <Divider orientation="right">총액 : {
        String(orderData.order.totalPrice).toString()
      .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") ?? ''
      } 원</Divider>
    : null}
  </>
  );
};

export default OrderView;
