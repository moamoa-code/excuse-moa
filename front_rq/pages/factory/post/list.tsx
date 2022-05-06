// 게시글 목록 / 관리
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { message, Table, Typography } from 'antd';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import Item from '../../../interfaces/item';
import { loadAllPostsAPI, loadMyPostListAPI, loadPostAPI } from '../../../apis/post';
import PostView from '../../../components/PostView';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../../components/MyTable';
import User from '../../../interfaces/user';

const ProviderPostList = () => {
  // const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: posts } = useQuery<Item[]>(['posts'], loadAllPostsAPI);
  const [ post, setPost ] = useState(null);
  const { Title } = Typography;
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const expandable = {
    expandedRowRender: (record) => {
      return <><PostView postId={record.id} /></>
    }
  };

  const columns = [
    {
      title: '번호',
      dataIndex: 'id',
      type: 'id',
      key: 'id',
    }, {
      title: '작성자',
      dataIndex: 'User',
      key: 'User',
      render: (text, record) => (
        <>{text?.company}</>
      ),
    }, {
      title: '공개범위',
      dataIndex: 'scope',
      key: 'scope',
      render: (text, record) => {
        if (text === 'PRIVATE'){
          return <>특정</>
        } if (text === 'GROUP'){
          return <>모든고객</>
        }if (text === 'PUBLIC'){
          return <>모든회원</>
        }
        else { return <>{text}</>}
      },
    },  {
      title: '제목',
      type: 'title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <>{text}</>
      ),
    }, {
      title: '작성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record) => (
        <>{dayjs(text).format('YYYY.MM.DD HH:mm')}{}</>
      ),
    }, {
      title: '',
      key: 'action',
      type: 'right',
      render: (text, record) => (
        <Link href={`/factory/post/edit/${record.id}`}><a>수정</a></Link>
      ),
    }, 
  ];

  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <Title level={4}>게시글 관리</Title> <br/>
        {isMobile?
          <MyTable 
            rowKey="id"
            columns={columns}
            dataSource={posts}
            expandable={expandable}
          />
        :
          <Table 
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={posts}
            expandable={expandable}
          />
        }
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
  if (response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI);
  await queryClient.prefetchQuery(['posts'], loadAllPostsAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ProviderPostList;
