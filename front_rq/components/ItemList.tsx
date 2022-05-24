import React, { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
import { Table, Button, notification, message, Space } from 'antd';
import Link from 'next/link';
import { useMutation, useQuery } from 'react-query';
import { addCartAPI } from '../apis/item';
import ItemView from './ItemView';
import { RightOutlined, DownOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import MyTable from './MyTable';


const ItemList = ({ items, myUserInfo }) => {
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const [loading, setLoading] = useState(false); 

  const mutation = useMutation<void, AxiosError, { itemId: number, userId: string }>(addCartAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      message.error(error.response?.data);
    },
    onSuccess: () => {
      message.success('장바구니에 상품을 추가했습니다.');
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onClickCart = (id) => (e) => {
      e.stopPropagation();
      const itemId = id;
      const userId = myUserInfo.id;
      mutation.mutate({ itemId,  userId });
  };

  const expandable = {
    expandedRowRender: (record) => 
    <ItemView item={record} myUserInfo={myUserInfo} />,
    columnWidth: 20,
    expandIcon: ({ expanded, onExpand, record }) =>
    expanded ? (
      <DownOutlined style={{color: '#64707a', fontSize: '8pt', margin: '0px'}} onClick={e => onExpand(record, e)} />
    ) : (
      <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
    )
  };

  const columns = [
    {
      title: 'id',
      type: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '제품명',
      type: 'title',
      dataIndex: 'name',
      key: 'name',
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
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</>
      ),
    }, {
      title: '',
      key: 'action',
      type: 'right',
      width: 40,
      render: (text, record) => (
        <Button
        icon={<ShoppingCartOutlined style={{color: '#00b4f0', fontSize: '16pt'}}/>}
          loading={loading}
          onClick={
            onClickCart(record.id)
          }
        />
      ),
    },
  ];

  return (
    <>
      {isMobile?
        <MyTable
          rowKey="id"
          columns={columns}
          expandable={expandable}
          dataSource={items}
        />
        :
        <Table 
          size="small"
          rowKey="id"
          columns={columns}
          expandable={expandable}
          dataSource={items}
        />
      }

    </>
  )
}

export default ItemList;
