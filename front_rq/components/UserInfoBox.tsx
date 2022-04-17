import React, { useCallback, useState } from 'react';
import { Empty } from 'antd';
import styled from 'styled-components';
import { IdcardOutlined, PhoneOutlined } from '@ant-design/icons';

const UserInfoDiv = styled.div`
  width:100%;
  margin: 10px 0px 10px px;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #d4d4d4;
  .company{
    font-size:14pt;
    font-wight:600;
    margin:10px;
  }
  .name{
    margin:10px;
  }
  .key{
    margin:10px;
  }
  .phone{
    margin:10px;
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
