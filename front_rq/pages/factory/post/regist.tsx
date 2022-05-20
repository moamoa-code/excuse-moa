// 상품 등록 페이지
// 관리자, 판매자만 열람 가능
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Router from 'next/router';

import React, { useCallback, useState, useRef } from 'react';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, List, Typography, message, Tag, Select } from 'antd';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';

import { backUrl } from '../../../config/config';

import { loadMyInfoAPI, loadProvidersAPI, loadUserAPI } from '../../../apis/user';
import { registerItemAPI, uploadImageAPI } from '../../../apis/item';
import AppLayout from '../../../components/AppLayout';
import useInput from '../../../hooks/useInput';
import User from '../../../interfaces/user';
import styled from 'styled-components';
import { SearchOutlined } from '@ant-design/icons';
import UserInfoBox from '../../../components/UserInfoBox';
import { Block, ContainerMid, OptionContainer, Red, SearchBlock } from '../../../components/Styled';
import { registerPostAPI } from '../../../apis/post';


const RegistPost = () => {
  const [loading, setLoading] = useState(false);
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const { Title } = Typography;
  const [ searchTxt, onChangeSearchTxt, setSearchTxt ] = useInput('');
  const [selectedProvider, setSelectedProvider] = useState<any>(null) // 선택된 판매자
  const [isProviderList, setIsproviderList] = useState(false);
  const [content, onChangeContent] = useInput('');
  const [title, onChangeTitle ] = useInput('');
  const [imagePath, setImagePath] = useState(null); // 게시글 사진 업로드 경로
  const [scope, setScope] = useState('PUBLIC');
  // 옵션선택
  const { Option } = Select;

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
        return message.error('jpg, png, gif파일만 업로드 가능합니다.');
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

  const onSearchClick = () => {
    if (searchTxt === '') {
      return message.error('값을 입력해주세요.')
    }
    setLoading(true);
    loadUserAPI(searchTxt)
      .then((response) => {
        message.success('판매사 ' + response.company + '선택완료');
        setSelectedProvider(response);
      })
      .catch((error) => {
        message.error(error.response.data);
        setSearchTxt('');
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = () => {
    const formData = new FormData();
    // data: { codeName: string, package: string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
    if (selectedProvider !== null){
      if (scope === 'PRIVATE' || scope === 'GROUP'){
        formData.append('providerId', selectedProvider.id);
      }
    }
    if (selectedProvider === null && (scope === 'PRIVATE' || scope === 'GROUP')) {
      return message.error('판매자를 선택해주세요.');
    }
    formData.append('title', title);
    formData.append('scope', scope);
    formData.append('content', content);
    if (imagePath){
      formData.append('imgSrc', imagePath);
    }
    setLoading(true);
    registerPostAPI(formData)
    .then((data) => {
      message.success('공지사항이 등록되었습니다.');
      Router.replace(`/factory/post/edit/${data}`);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const handleRoleChange = (value) => {
    setScope(value);
    if (value === 'PUBLIC') {
      setSelectedProvider(null);
      setSearchTxt('');
    }
  }


  return (
    <AppLayout>
    <ContainerMid>
      <Head>
        <title>공지사항 등록</title>
      </Head>
      <Title level={3}>공지사항 등록</Title>
      <Form style={{ margin: '10px 0 20px' }} encType="multipart/form-data" onFinish={onSubmit} >
        <Block>
          <label><Red>* </Red>공지 구분</label>
          <Select
            onChange={handleRoleChange}
            defaultValue={scope}
          >
            <Option value='PUBLIC'>관리자 공지사항</Option>
            <Option value='GROUP'>판매자의 모든고객</Option>
            <Option value='PRIVATE'>판매자의 특정고객전용</Option>
          </Select>
        </Block>
        {scope === 'PRIVATE' || scope === 'GROUP'?
        <>
          <label style={{margin: '0 0 7px 0'}}>판매자 선택</label>
          <SearchBlock>
            <div>
              <input
                value={searchTxt}
                onChange={onChangeSearchTxt}
                maxLength={20}
                placeholder='사업자등록번호(아이디)'
              />
              <button type='button' className='search' onClick={onSearchClick}>
                <SearchOutlined />
              </button>
            </div>
            <button 
              type='button' 
              onClick={()=>{
                setIsproviderList(!isProviderList);
              }}>목록보기
            </button>
          </SearchBlock>
          <Block>
            {isProviderList?
              <OptionContainer>
              {providerList?.map((v)=>{
                return (
                  <p
                    key={v.id}
                    className='provider' 
                    onClick={() => {
                    setSelectedProvider(v);
                    setSearchTxt(v.key);
                    message.success('판매사 ' + v.company + '선택완료');
                  }}>{v.company}</p>
                  ) 
              })}
            </OptionContainer>
            : null}
            {selectedProvider?.id?
              <UserInfoBox userInfo={selectedProvider} />
            :null}
          </Block>
        </>
        :null}
        <Block>
          <label>제목</label>
          <Input
            placeholder='제목 입력'
            value={title} 
            onChange={onChangeTitle}
            maxLength={25}
          />
        </Block>
        <Block>
          <label>내용</label>
          <Input.TextArea
            placeholder='내용 입력 (1000자 제한)'
            value={content} 
            onChange={onChangeContent}
            maxLength={1000}
          />
        </Block>
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
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            공지 등록
          </Button>
        </div>
      </Form>
    </ContainerMid>
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
  if (response.role !== 'ADMINISTRATOR') { // 관리자 권한
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
