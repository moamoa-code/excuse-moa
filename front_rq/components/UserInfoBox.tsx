import React, { useCallback, useState } from 'react';
import { Empty } from 'antd';
import styled from 'styled-components';
import { IdcardOutlined, PhoneOutlined } from '@ant-design/icons';

const UserInfoDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  width:100%;
  margin: 10px 0px 10px px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #d4d4d4;
  box-shadow: 0px 9px 10px -4px rgba(0,0,0,0.07);
  @media screen and (max-width: 600px) {
    padding: 15px;
  }
  .company{
    font-size:14pt;
    font-wight:600;
  }
  .name{
  }
  .key{
  }
  .phone{
  }
`

const UserInfoBox = ({ userInfo }: any) => {
  if (!userInfo) {
    return (
      <UserInfoDiv>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </UserInfoDiv>
    );
  }

  return (  
  <UserInfoDiv>
    <span className='company'>{userInfo?.company}</span>
    <span className='name'>{userInfo?.name}</span>
    <span className='phone'><PhoneOutlined /> {userInfo?.phone}</span>
    <span className='key'><IdcardOutlined /> {userInfo?.key}</span>
  </UserInfoDiv>
  );
};

export default UserInfoBox;
