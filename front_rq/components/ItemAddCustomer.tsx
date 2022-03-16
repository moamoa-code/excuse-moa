import React, { useState, useCallback } from 'react';
import { Form, Input, Checkbox, Button, List } from 'antd';


// 제품에 열람가능 회원 추가

// setIsLoggendIn -> components/AppLayout에서 옴
const ItemAddCustomer = ({myUserInfo, itemId}) => {

  const onAddCustomer = useCallback(
    (customerId) => () => {

    }, [],
  );

  return (
    <div>
      <p>{JSON.stringify(myUserInfo)}</p>
    <List
      className="demo-loadmore-list"
      itemLayout="horizontal"
      dataSource={myUserInfo.Customers}
      renderItem={(customer:any) => (
        <List.Item
          key={customer.id}
          actions={[
          <>
            <Button type="primary" shape="circle" onClick={onAddCustomer(customer.id)}>등록</Button>
          </>
          ]}
        >
          <List.Item.Meta
            title={
              <>
              {customer.company} <span>담당자: {customer.id}</span>
            </>}
          />
        </List.Item>
      )}
    />
  </div>
  );
};

export default ItemAddCustomer;
