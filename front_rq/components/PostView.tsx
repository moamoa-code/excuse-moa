import React, { useCallback, useState } from 'react';
import { Descriptions, Tag, Button, Divider, Image, Card } from 'antd';
import Router from 'next/router';
import dayjs from 'dayjs';


const PostView = ({ post }) => {
  if (!post.title) {
    return (
      <>
      <Card
        title=""
      >아직 판매자 메시지가 없습니다.</Card>
      </>
    );
  };
  return (
    <>
      <Card
        title={post.title}
        extra={dayjs(post.createdAt).format('YYYY.MM.DD HH:mm')}
        size='small'
      >
        {post.imgSrc ?
        <div style={{ textAlign: 'center' }}>
          {/* <Image src={`${backUrl}/${post.imgSrc}`} style={{ maxHeight: '300px'}}/> */}
          <Image src={`${post.imgSrc}`} style={{ maxHeight: '300px'}}/>
        </div>
        : null
        }
        <pre>{post.content}</pre>
        <span>{post.User?.company}</span>
      </Card>
    </>
  )
}

export default PostView;
