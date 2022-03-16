// 판매자의 게시글 리스트
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button, Table, Typography } from 'antd';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import User from '../../interfaces/user';
import Item from '../../interfaces/item';
import { loadMyPostListAPI, loadPostListAPI } from '../../apis/post';
import PostList from '../../components/PostList';
import PostView from '../../components/PostView';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const ProviderPostList = () => {
  // const queryClient = useQueryClient();
  const { data: posts } = useQuery<Item[]>(['myposts'], loadMyPostListAPI);
  const { Title } = Typography;
  const [pageSize, setPageSize] = useState<number>(10);

  const togglePageSize = () => {
    if (pageSize === 10){
      setPageSize(100);
    } else {
      setPageSize(10);
    }
  }

  const columns = [
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <>{text}</>
      ),
    }, {
      title: '작성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'right',
      render: (text, record) => (
        <>{dayjs(text).format('YYYY.MM.DD HH:mm')}{}</>
      ),
    }, {
      title: '',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Link href={`/post/edit/${record.id}`}><a>수정/열람회원 등록</a></Link>
      ),
    },
  ]

  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <Title level={4}>작성한 공지사항 목록</Title>
        <Table 
          size="small"
          rowKey="id"
          columns={[
            {
              title: '제목',
              dataIndex: 'title',
              key: 'title',
              render: (text, record) => (
                <>{text}</>
              ),
            }, {
              title: '작성일',
              dataIndex: 'createdAt',
              key: 'createdAt',
              align: 'right',
              render: (text, record) => (
                <>{dayjs(text).format('YYYY.MM.DD HH:mm')}{}</>
              ),
            }, {
              title: '',
              key: 'action',
              align: 'right',
              render: (text, record) => (
                <Link href={`/post/edit/${record.id}`}><a>수정/열람회원 등록</a></Link>
              ),
            },
          ]}
          expandable={{
            expandedRowRender: (record) => 
            <PostView post={record}/>,
            expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <DownOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
            ) : (
              <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
            ),
            expandRowByClick: true
          }}
          pagination={{
            pageSize: pageSize
          }}
          dataSource={posts}
        />
        <Button onClick={togglePageSize}>페이지 확장/축소</Button>
      </div>
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['myposts'], loadMyPostListAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ProviderPostList;
