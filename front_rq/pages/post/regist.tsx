// 공지사항 작성 페이지
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Button, notification, Space, Tag } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';
import Router from 'next/router';

import { loadMyInfoAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import useInput from '../../hooks/useInput';
import User from '../../interfaces/user';
import { backUrl } from '../../config/config';
import { registerPostAPI, uploadImageAPI } from '../../apis/post';

const Container500 = styled.div`
max-width: 500px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

const RegistPost = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [content, onChangeContent] = useInput('');
  const [title, onChangeTitle ] = useInput('');
  const [imagePath, setImagePath] = useState(null); // 게시글 사진 업로드 경로


  const openNotification = () => {
    notification.open({
      message: `게시글 작성이 완료됐습니다. `,
      description:
        `열람가능한 고객을 설정해주세요.`,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 4,
    });
  };

  // 사진 업로드
  const imageInput = useRef<HTMLInputElement>(null);
  const onClickImageUpload = useCallback(() => {
    imageInput.current?.click();
  }, []);
  const onChangeImage = useCallback((e) => {
    console.log('files[0]', e.target.files[0]);
    const fileName = e.target.files[0]?.name.split('.');
    const fileExt = fileName[fileName.length-1].toLowerCase();
    if (fileExt !== 'jpg' && fileExt !== 'png' && fileExt !== 'gif'){
      return alert('jpg, png, gif파일만 업로드 가능합니다.');
    }
    const imageFormData = new FormData();
    imageFormData.append('image', e.target.files[0])
    uploadImageAPI<string>(imageFormData).then((result) => {
      console.log('result', result);
      setImagePath(result);
      console.log('onChange imagePath', imagePath);
    });
  }, []);
  // 업로드한 사진 제거 (패스만 제거)
  const onRemoveImage = useCallback(() => {
      console.log('사진제거')
      setImagePath(null);
    },
    [],
  );

  const onSubmit = useCallback(() => {
    console.log('imagePath',imagePath)
    setLoading(true);
    const formData = new FormData();
    // data: { codeName: string, package: string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
    formData.append('title', title);
    formData.append('content', content);
    if (imagePath){
      formData.append('imgSrc', imagePath);
    }
    console.log('omSubmit imagePath', imagePath)
    registerPostAPI(formData)
    .then((data) => {
      console.log(data);
      openNotification();
      Router.replace(`/post/edit/${data}`);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [content]);

  return (
  <AppLayout>
    <Container500>
      <Head>
        <title>공지사항 작성</title>
      </Head>
      <Title level={3}>공지사항 작성</Title>
      <Form style={{margin: '30px 0 20px 0'}}
        onFinish={onSubmit}>
        <label>제목</label>
        <Input
          placeholder='제목 입력'
          value={title} 
          onChange={onChangeTitle}
          maxLength={25}
        />
        <label>내용</label>
        <Input.TextArea
          placeholder='내용 입력 (250자 제한)'
          value={content} 
          onChange={onChangeContent}
          maxLength={250}
        />
        <div>
          <br />
          <label htmlFor="user-price">이미지 (2MB 제한) </label>
          <input type="file" name="image" hidden ref={imageInput} onChange={onChangeImage} />
          <Button onClick={onClickImageUpload}>이미지 업로드</Button>
          {imagePath?
            <div>
              <img src={`${backUrl}/${imagePath}`} style={{ width: '200px' }} />
              <div>
                <Button onClick={onRemoveImage}>제거</Button>
              </div>
            </div> : null
          }

        </div>
        <div style={{ margin: '15px 0 30px 0'}}>
          <Button type="primary" htmlType="submit" loading={loading}>
            작성완료
          </Button>
        </div>
      </Form>
    </Container500>
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const id = context.params?.id as string;
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 판매자권한
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};


export default RegistPost;
