import React, { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
import { Table, Button, notification } from 'antd';
import Link from 'next/link';
import { useMutation, useQuery } from 'react-query';
import { addCartAPI } from '../apis/item';
import ItemView from './ItemView';
import { RightOutlined, DownOutlined, ShoppingCartOutlined } from '@ant-design/icons';


const ItemList = ({ items, myUserInfo }) => {
  // console.log('ItemList', items);
  const [notiApi, contextHolder] = notification.useNotification(); // antd 알림창
  const [loading, setLoading] = useState(false); 

  const openNotification = () => {
    notification['success']({
      message: '장바구니에 상품이 추가되었습니다.',
      placement: 'topLeft',
      duration: 1.5,
    });
  };

  const mutation = useMutation<void, AxiosError, { itemId: number, userId: string }>(addCartAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: () => {
      // queryClient.setQueryData('user', null);
    },
    onSettled: () => {
      setLoading(false);
      openNotification();
    },
  });

  const onClickCart = (id) => () => {
      const itemId = id;
      const userId = myUserInfo.id;
      console.log(itemId, userId);
      mutation.mutate({ itemId,  userId });
  };

  const columns = [
    {
      title: '제품명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <>{text}</>
      ),
    },
    {
      title: '포장종류',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: '무게단위',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '공급가',
      key: 'supplyPrice',
      dataIndex: 'supplyPrice',
      render: (text, record) => (
        <>{text.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'right',
      width: 40,
      render: (text, record) => (
        <Button
        icon={<ShoppingCartOutlined style={{color: '#00b4f0', fontSize: '16pt'}}/>}
          loading={loading}
          onClick={onClickCart(record.id)}
        ></Button>
      ),
    },
  ];

  return (
    <>
      <Table 
        size="small"
        rowKey="id"
        columns={
          [
            {
              title: '제품명',
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <>{text}</>
              ),
            },
            {
              title: '포장종류',
              dataIndex: 'packageName',
              key: 'packageName',
            },
            {
              title: '무게단위',
              dataIndex: 'unit',
              key: 'unit',
            },
            {
              title: '공급가',
              key: 'supplyPrice',
              dataIndex: 'supplyPrice',
              render: (text, record) => (
                <>{text.toString()
                  .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</>
              ),
            },
            {
              title: '',
              key: 'action',
              align: 'right',
              width: 40,
              render: (text, record) => (
                <Button
                icon={<ShoppingCartOutlined style={{color: '#00b4f0', fontSize: '16pt'}}/>}
                  loading={loading}
                  onClick={onClickCart(record.id)}
                ></Button>
              ),
            },
          ]}
        expandable={{
          expandedRowRender: (record) => 
          <ItemView item={record} myUserInfo={myUserInfo} />,
          columnWidth: 20,
          expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <DownOutlined style={{color: '#64707a', fontSize: '8pt', margin: '0px'}} onClick={e => onExpand(record, e)} />
          ) : (
            <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
          )
        }}
        dataSource={items}
      />
    </>
  )
}

export default ItemList;
