// 상품 등록 페이지
// 관리자, 판매자만 열람 가능
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Router from 'next/router';

import React, { useCallback, useState, useRef } from 'react';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, List, Typography, message, Tag } from 'antd';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';

import { backUrl } from '../../../config/config';

import { loadMyInfoAPI, loadProvidersAPI, loadUserAPI } from '../../../apis/user';
import { registerItemAPI, uploadImageAPI } from '../../../apis/item';
import AppLayout from '../../../components/AppLayout';
import useInput from '../../../hooks/useInput';
import User from '../../../interfaces/user';
import styled from 'styled-components';

const Container600 = styled.div`
max-width: 600px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`
const OptionContainer = styled.div`
  padding: 10px 0px 10px 0px;
  display: block;
  overflow:auto;
  max-height:300px;
  p {
    display: inline-block;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 5px 8px 5px 8px;
    margin: 6px;
    font-size: 10pt;
  }
  p:active {
    position: relative; 
    top:2px;
  }
  .codeName{
    background-color:#00B4D8;
    color: white;
  }
  .unit{
    background-color:#FF5C8D;
    color: white;
  }
  .package{
    background-color:#ec7728;
    color: white;
  }
  .provider{
    border: 1px solid #999999;
  }
`
const Block = styled.div`
  margin: 18px 0 18px 0;
  label {
    display: block;
    margin: 0 0 7px 0;
  }
  input {
    width: 100%;
    height: 38px;
  }
`
const RedBold = styled.span`
  color:red;
`


const RegistItem = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const { Title } = Typography;
  const [codeName, setCodeName] = useState(''); // 제품 코드명 (사용자 비공개)
  const [name, onChangeName] = useInput(''); // 제품 이름
  const [packageName, setPackage] = useState(''); // 제품 포장 종류
  const [unit, setUnit] = useState(''); // 제품 무게 단위
  const [msrp, setMsrp] = useState(''); // 권장소비가
  const [price, setPrice] = useState(''); // 실제 공급가 
  const [description, onChangeDesc] = useInput(''); // 권장소비가
  const [imagePath, setImagePath] = useState<string>(); // 제품사진 업로드 경로
  const [selectedProvider, setSelectedProvider] = useState<any>({}) // 선택된 판매자
  const { Search } = Input;
  const [isProviderList, setIsproviderList] = useState(false);
  // 옵션선택
  const codeNames = ['HOUSE', 'DECAFFEIN'];
  const units = ['200g', '500g', '1Kg'];
  const packages = ['M 무지', 'M 브랜드스티커', 'M 브랜드인쇄', '지퍼 무지', '지퍼 브랜드인쇄', '지퍼 브랜드스티커'];

  const onChangeCodeName = (e) => {
    setCodeName(e.target.value);
  }
  const onChangeUnit = (e) => {
    setUnit(e.target.value);
  }
  const onChangePack = (e) => {
    setPackage(e.target.value);
  }
  const onChangeMsrp = useCallback( // 가격 유효성검사
    (e) => {
      const { value } = e.target;
      const onlyNumber = value.replace(/[^0-9]/g, '');
      // const regExpPhone = /[^0-9]/;
      setMsrp(onlyNumber);
      // setPhoneValidError(!regExpPhone.test(e.target.value));
    },
    [msrp],
  );
  const onChangePrice = useCallback( // 가격 유효성검사
    (e) => {
      const { value } = e.target;
      const onlyNumber = value.replace(/[^0-9]/g, '');
      // const regExpPhone = /[^0-9]/;
      setPrice(onlyNumber);
      // setPhoneValidError(!regExpPhone.test(e.target.value));
    },
    [price],
  );

  // 제품사진 업로드
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
      setImagePath(null);
    },
    [],
  );

  const onSubmit = useCallback(() => {
    setLoading(true);
    const formData = new FormData();
    // data: { codeName: string, package: string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
    if (selectedProvider.id === undefined || selectedProvider.id === null || selectedProvider.id ==='') {
      message.error('판매회원을 선택해 주세요.')
    }
    formData.append('providerId', selectedProvider.id);
    formData.append('codeName', codeName);
    formData.append('name', name);
    formData.append('packageName', packageName);
    formData.append('unit', unit);
    formData.append('msrp', msrp);
    formData.append('supplyPrice', price);
    formData.append('description', description);
    // for (var pair of formData.entries()) {
    //   console.log(pair[0]+ ', ' + pair[1]);
    // }
    if (imagePath){
      formData.append('imgSrc', imagePath);
    }
    registerItemAPI(formData)
    .then((data) => {
      Router.replace(`/factory/item/edit/${data.id}`);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [codeName, selectedProvider, name, packageName, unit, msrp, price, imagePath, description]);

  
  const onSearchProvider = (value) => {
    console.log(value);
    setLoading(true);
    loadUserAPI(String(value).trim())
      .then((response) => {
        if (response.role !== 'PROVIDER') {
          return message.error('판매자 회원이 아닙니다.');
        }
        setSelectedProvider(response);
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
    <AppLayout>
    <Container600>
      <Head>
        <title>제품등록</title>
      </Head>
      {/* <div>{JSON.stringify(myUserInfo)}</div><br /> */}
      {/* <p>{myUserInfo.Customers.map((v) => (
        <p>{v.id}</p>
      ))}</p> */}
      <Title level={3}>제품 등록</Title>
      <Form style={{ margin: '10px 0 20px' }} encType="multipart/form-data" onFinish={onSubmit}>
        <Block>
          <label htmlFor="item-code"><RedBold>* </RedBold>판매자 선택</label>
          <Search placeholder="ID / 사업자 등록번호 검색" onSearch={onSearchProvider} enterButton /><br />
          <Button
            onClick={()=>{
              setIsproviderList(!isProviderList);
            }}>
            목록보기
          </Button><br />
          {isProviderList?
            <OptionContainer>
            {providerList?.map((v)=>{
              return (
                <p className='provider' onClick={() => {
                  setSelectedProvider(v);
                }}>{v.company}</p>
                ) 
            })}
          </OptionContainer>
          : null}
          {selectedProvider.id?
          <div style={{marginTop:'10px'}}>
            <b>선택된 판매자: </b>
            <Tag>{selectedProvider?.id} / {selectedProvider?.company}</Tag>
          </div>
          :null}
        </Block>
        <Block>
          <label htmlFor="item-code"><RedBold>* </RedBold>제품 코드명 (구매자 비공개)</label>
          <Input name="item-code" value={codeName} required onChange={onChangeCodeName} maxLength={10}/>
          <OptionContainer>
            {codeNames.map((v)=>{
              return (
              <p className='codeName' onClick={() => {
                setCodeName(v);
              }}>{v}</p>
              )
            })}
          </OptionContainer>
        </Block>
        <Block>
          <label htmlFor="item-code"><RedBold>* </RedBold>제품 포장 종류</label>
          <Input name="item-package" value={packageName} required onChange={onChangePack} maxLength={20}/>
          <OptionContainer>
            {packages.map((v)=>{
              return (
              <p className='package' onClick={() => (setPackage(v))}>{v}</p>
              )
            })}
          </OptionContainer>
        </Block>
        <Block>
          <label htmlFor="user-name"><RedBold>* </RedBold>제품명</label>
          <Input name="user-name" value={name} required onChange={onChangeName} maxLength={25}/>
        </Block>
        <Block>
          <label htmlFor="user-unit"><RedBold>* </RedBold>무게 단위</label>
          <Input name="user-unit" value={unit} onChange={onChangeUnit} maxLength={10}/>
          <OptionContainer>
            {units.map((v)=>{
              return (
              <p className='unit' onClick={() => (setUnit(v))}>{v}</p>
              )
            })}
          </OptionContainer>
        </Block>
        <Block>
          <label htmlFor="user-msrp">권장소비자가 (구매자 비공개)</label>
          <Input name="user-msrp" value={msrp} onChange={onChangeMsrp} placeholder='숫자만 입력' maxLength={12}/>
        </Block>
        <Block>
          <label htmlFor="user-price">판매가</label>
          <Input name="user-price" type="price" value={price} onChange={onChangePrice} placeholder='숫자만 입력' maxLength={12}/>
        </Block>
        <Block>
          <label htmlFor="user-price">간단한 제품설명</label>
          <Input name="user-description" type="price" value={description} onChange={onChangeDesc} maxLength={100}/>
        </Block>
        <div>
          <label htmlFor="user-price">제품사진 (2MB 제한)</label><br />
          <input type="file" accept="image/*" name="image" hidden ref={imageInput} onChange={onChangeImage} />
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
            제품 등록
          </Button>
        </div>
      </Form>
      {/* <ItemAddCustomer myUserInfo={myUserInfo} itemId={1}/> */}
    </Container600>
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
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RegistItem;
