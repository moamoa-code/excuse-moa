import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { backUrl } from '../config/config';
import { Descriptions, Tag, Button, Divider, Image } from 'antd';
import Router from 'next/router';


const ItemView = ({ item, myUserInfo }) => {
  return (
    <>
      <Divider>제품 상세보기</Divider>
      {item.imgSrc ?
        <div style={{ textAlign: 'center' }}>
          <Image src={`${backUrl}/${item.imgSrc}`} style={{ maxHeight: '500px'}} />
        </div>
        : null
      }
      <Descriptions
        bordered
        size="small"
        title={item.User.company}
        extra={item.UserId === myUserInfo.id ? 
          <><Link href={`/item/edit/${item.id}`}><a>
            <Button type="primary">수정</Button>
          </a></Link>
          </>
        : null}
      >
        {item.UserId === myUserInfo.id ? 
          <Descriptions.Item label={
            <>
              코드명
              <span style={{color: 'blue'}}>*</span>
            </>
          }>{item.codeName}</Descriptions.Item>
        : null}
        <Descriptions.Item label="제품명">{item.name}</Descriptions.Item>
        <Descriptions.Item label="포장">{item.packageName}</Descriptions.Item>
        <Descriptions.Item label="무게단위">{item.unit}</Descriptions.Item>
        {item.UserId === myUserInfo.id ? 
        <Descriptions.Item label={
            <>
              <span>권장소비자가</span> <span style={{color: 'blue'}}>*</span>
            </>
          }>{item.msrp.toString()
            .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</Descriptions.Item>
        : null}
        <Descriptions.Item label="공급가">{item.supplyPrice.toString()
  .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</Descriptions.Item>
        <Descriptions.Item label="제품설명">{item.description}</Descriptions.Item>
      </Descriptions>
      {item.UserId === myUserInfo.id ? 
          <p style={{color: 'blue', margin: '10px'}}>* 고객 비노출 항목</p>
        : null}
    </>
  )
}

export default ItemView;
