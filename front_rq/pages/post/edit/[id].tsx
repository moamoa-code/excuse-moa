// 공지 수정/ 열람가능 고객 추가
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';
import { Form, Input, Button, Tag, Checkbox, Divider, Space, notification, Card, Image, Typography, Popconfirm } from 'antd';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';

import { CheckCircleOutlined } from '@ant-design/icons';
import { addCustomerToPostAPI, deltePostAPI, editPostAPI, loadPostAPI, registerPostAPI } from '../../../apis/post';
import Post from '../../../interfaces/post';
import { backUrl } from '../../../config/config';

import PostView from '../../../components/PostView';
import useInput from '../../../hooks/useInput';
import { uploadImageAPI } from '../../../apis/item';
import styled from 'styled-components';

const Container500 = styled.div`
  max-width: 500px;
  margin 0 auto;
  padding: 10px;
`

const EditPost = () => {
  const router = useRouter();
  const queryClient = new QueryClient();
  // const queryClient = useQueryClient();
  const { Title } = Typography;
  const { id } = router.query; // 공지 id
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [content, onChangeContent, setContent] = useInput<string>('');
  const [title, onChangeTitle, setTitle] = useInput<string>('');
  const [imagePath, setImagePath] = useState(null); // 게시글 사진 업로드 경로
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: post } = useQuery<Post>(['post', id], () => loadPostAPI(Number(id)),{
    onSuccess(data) {
      setTitle(data.title);
      setContent(data.content);
      if(data.imgSrc){
        setImagePath(data.imgSrc);
      }
    }
  });

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
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

  const onSubmit = (values) => {  // 열람가능 회원 추가
    console.log(values);
    addCustomerToPostAPI({ id, values })
    .then(() => {
      openNotification('게시글을 열람가능한 고객 추가를 완료했습니다.')
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);

    })
  }
  const onEditSubmit = () => {  // 수정 완료
    console.log('imagePath',imagePath)
    setLoading(true);
    const formData = new FormData();
    // data: { codeName: string, package: string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
    formData.append('postId', String(post.id));
    formData.append('title', title);
    formData.append('content', content);
    if (imagePath){
      formData.append('imgSrc', imagePath);
    }
    console.log('omSubmit imagePath', imagePath)
    editPostAPI(formData)
    .then((data) => {
      console.log(data);
      openNotification('수정이 완료되었습니다.');
      setEditMode(false);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
      queryClient.invalidateQueries(['post',id]);
    });
  }

  const onDelete = () => {
    deltePostAPI({id})
    .then(() => {
      openNotification('삭제가 완료되었습니다.');
      setEditMode(false);
      Router.replace('/management/posts');
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  return (
    <AppLayout>
      <Container500>
      <Divider orientation="left"><Title level={4}>공지사항 수정</Title></Divider>
        {editMode? <>
          <Form style={{margin: '30px 0 20px 0'}}
            onFinish={onEditSubmit}>
          <label>제목</label>
          <Input
            placeholder='제목 입력'
            value={title} 
            onChange={onChangeTitle}
          /><br />
          <label>내용</label>
          <Input.TextArea
            placeholder='내용 입력 (250자 제한)'
            value={content} 
            onChange={onChangeContent}
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
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                수정완료
              </Button>
              <Popconfirm
                title="삭제하시겠습니까?"
                onConfirm={onDelete}
                okText="삭제"
                cancelText="아니오"
              >
                <Button danger loading={loading}>
                  삭제
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </Form>
        </>
        : <>
        <PostView post={post} />
          <br />
          <Button type="primary" htmlType="submit" onClick={() => (setEditMode(true))}>
              수정모드
          </Button>
        </>}
        <br/><br/>
        <Form 
          style={{ margin: '10px 0 20px' }}
          encType="multipart/form-data"
          onFinish={onSubmit}
          initialValues={{ // 제품 볼 수 있는 유저 체크
            'customerIds': post.PostViewUsers.map((v : Post) => (v.id)),
          }}
        >
        <Divider orientation="left"><Title level={4}>열람가능한 고객 설정</Title></Divider>
          <Form.Item name="customerIds">
            <Checkbox.Group>
              <Space size={8} wrap>
                {myUserInfo.Customers.map((v) => (
                  <>
                    <Tag color="blue"><Checkbox value={v.id}>{v.company} / {v.name}</Checkbox> </Tag>
                  </>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              적용 완료
            </Button>
            <Link href="/management/posts"><a>
              <Button htmlType="submit" loading={loading}>
              목록으로
              </Button>
            </a></Link>
          </Space>
        </Form>
      </Container500>
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 판매자권한
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['post', id], () => loadPostAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default EditPost;
