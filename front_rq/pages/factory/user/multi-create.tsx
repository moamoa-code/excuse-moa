// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useCallback, useState, useEffect } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Select, message, Radio } from 'antd';
import { SearchOutlined, SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';

import { loadMyInfoAPI, createUserAPI, loadUserAPI, loadProvidersAPI, createUsersAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import useInput from '../../../hooks/useInput';
import UserInfoBox from '../../../components/UserInfoBox';


const UserFormTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #444444;
  th {
    font-size: 12pt;
    height: 40px;
    background-color: #f6f6f6;
    border: 1px solid #444444;
  }
  td {
    text-align: center;
    border: 1px solid #444444;
  }
  input {
    width: 100%;
    padding: 4px 0px 4px 0px;
    border: none;
  }
  tr {
    margin-bottom: 5px;
  }
`
const RedBold = styled.span`
  color:red;
`
const Container1024 = styled.div`
  max-width: 1024px;
  margin 0 auto;
  padding: 15px;
`
const Block = styled.div`
  margin: 18px 0 18px 0;
  label {
    display: block;
    margin: 0 0 7px 0;
  }
  input {
    width: 100%;
    padding-left: 5px;
    height: 38px;
    border: 1px solid #999999;
    border-radius: 4px;
  }
`
const SearchBlock = styled.div`
  margin: 18px 0 18px 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  input {
    flex-grow: 1;
    height: 38px;
    margin: 0;
    padding-left: 5px;
    box-sizing : border-box;
    border-radius: 4px 0 0 4px;
    border: 1px solid #999999;
  }
  .search{
    color: white;
    font-size: 12pt;
    font-weight: 800;
    min-width: 35px;
    border:0;
    margin: 0;
    border-radius: 0 4px 4px 0;
    background-color:#1890ff;
  }
  button {
    margin-left: 5px;
    height: 38px;
    border-radius: 4px;
    border: 1px solid #999999;
    background-color:white;
  }
  button:active {
    position: relative; 
    top:2px;
  }
  label {
    display: block;
    margin: 0 0 7px 0;
  }
`
const OptionContainer = styled.div`
  background-color: #f1f8ff;
  padding: 10px 0px 10px 0px;
  display: block;
  overflow:auto;
  max-height:300px;
  p {
    background-color: white;
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

const CreateUser = () => {
  const [ loading, setLoading ] = useState(false);
  const [ userRole, setUserRole ] = useState('PROVIDER');
  const [ selectedProvider, setSelectedProvider ] = useState();
  const [ selectedProviderKey, setSelectedProviderKey ] = useState('');
  const [ isAutoKey, setIsAutoKey ] = useState(false);
  const [ isAddrMode, setIsAddrMode ] = useState(false);
  const [ userInputs, setUserInputs ] = useState([{
    key: '', company: '', name: '', phone: '', zip: '', address: ''  
  }]);
  const [isProviderList, setIsproviderList] = useState(false);
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const [ searchTxt, onChangeSearchTxt, setSearchTxt ] = useInput('');
  const { Title } = Typography;
  const { Option } = Select;

  const onSetFieldMax = () => {
    let inputs = [...userInputs];
    const input = { key: '', company: '', name: '', phone: '', zip: '', address: '' };
    for (let i = userInputs.length; i < 10; i++){
      inputs.push(input);
    }
    setUserInputs(inputs);
  }

  const onAddField = () => {
    if (userInputs.length > 9) {
      return message.error('최대 10개 필드까지 입력 가능합니다.')
    }
    setUserInputs([...userInputs, { key: '', company: '', name: '', phone: '', zip: '', address: '' }]);
  }
  const onRemoveField = () => {
    const list = [...userInputs];
    list.splice(userInputs.length - 1, 1);
    setUserInputs(list);
  }

  const onInitField = () => {
    setUserInputs([{ key: '', company: '', name: '', phone: '', zip: '', address: '' }]);
  }

  // 폼 배열 입력
  const handleInputChange = (e, index) => {
    // const { name, value } = e.target;
    const name = e.target.name;
    let value = e.target.value;
    if (name === 'phone' || name === 'zip'){
      value = e.target.value.replace(/[^0-9]/g, '');
    }
    if (name === 'key'){
      value = e.target.value.replace(/[ㄱ-힣\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\")]/g, '').trim().toLowerCase();
    }
    const list = [...userInputs];
    list[index][name] = value;
    setUserInputs(list);
  }

  // const onInputChange = (e) => {
  //   console.log(e.target.value);
  //   console.log(e.target.id);
  //   console.log(e.target.name);
  //   const list = [...userInputs];
  //   list[e.target.id].name = e.target.value;
  //   console.log(list);
  //   setUserInputs(list);
  // }

  // 회원등급 변경
  const handleRoleChange = (value) => {
    setUserRole(value);
    if (value === 'PROVIDER' || 'NOVICE') {
      setSelectedProviderKey('');
      setSelectedProvider(null);
      setSearchTxt('');
      setIsproviderList(false);
    }
  }

  // 아이디 자동생성 모드 변경
  const handleAutoKeyChange = (e) => {
    setIsAutoKey(e.target.value);
    if (e.target.value === true) {
      let list = [...userInputs];
      for(let i = 0; i < list.length; i++) {
        list[i].key = '';
      }
      setUserInputs(list);
    }
  }
  
  // 주소입력모드 변경
  const handleAddrModeChange = (e) => {
    setIsAddrMode(e.target.value);
    if (e.target.value === false) {
      let list = [...userInputs];
      for(let i = 0; i < list.length; i++) {
        list[i].zip = '';
        list[i].address = '';
      }
      setUserInputs(list);
    }
  }

  // 판매자 회원 찾기
  const onSearchClick = () => {
    setLoading(true);
    if (searchTxt === '') {
      setLoading(false);
      return message.error('값을 입력해주세요.')
    }
    loadUserAPI(searchTxt)
      .then((response) => {
        message.success('판매사 ' + response.company + '선택완료');
        setSelectedProviderKey(response.key);
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

  // 폼 전송
  const onReqCreatUsers = (e) => {
    e.preventDefault();
    setLoading(true);
    const datas = {
      role: userRole,
      ProviderKey: selectedProviderKey,
      isAutoKey,
      isAddrMode,
      userDatas: userInputs
    }
    console.log(datas);
    createUsersAPI(datas)
    .then((result) => {
      message.success('회원생성이 완료됐습니다.')
      console.log(result);
    })
    .catch((error) => {
      message.error('아이디 중복, 잘못된 입력 등의 이유로 회원생성에 실패했습니다.');
    })
    .finally(() => {
      setLoading(false);
    });
  }


  return (
  <AppLayout>
      <Container1024>
      <Head>
          <title>회원 생성</title>
        </Head>
        <Title level={3}>회원 생성</Title><br />
      <Radio.Group onChange={handleAutoKeyChange} defaultValue={false}>
        <Radio.Button value={false}>아이디 수동입력</Radio.Button>
        <Radio.Button value={true}>아이디 자동생성</Radio.Button>
      </Radio.Group><br /><br />
      <Radio.Group onChange={handleAddrModeChange} defaultValue={false}>
        <Radio.Button value={false}>주소 없음</Radio.Button>
        <Radio.Button value={true}>주소 입력</Radio.Button>
      </Radio.Group>
      <form onSubmit={onReqCreatUsers}>
        <Block>
          <label><RedBold>* </RedBold>회원 구분</label>
          <Select
            onChange={handleRoleChange}
            defaultValue={userRole}
          >
            <Option value='PROVIDER'>판매자</Option>
            <Option value='CUSTOMER'>구매자</Option>
            <Option value='NOVICE'>비회원</Option>
          </Select>
        </Block>
        {userRole === 'CUSTOMER'?
          <>
            <label style={{margin: '0 0 7px 0'}}>판매자 선택</label>
            <SearchBlock>
              <input
                value={searchTxt}
                onChange={onChangeSearchTxt}
              />
              <button type='button' className='search' onClick={onSearchClick}>
                <SearchOutlined />
              </button>
              <button 
                type='button' 
                onClick={()=>{
                  setIsproviderList(!isProviderList);
                }}>목록보기
              </button>
            </SearchBlock>
            {isProviderList?
              <>
                <OptionContainer>
                  {providerList?.map((v)=>{
                    return (
                      <p className='provider' onClick={() => {
                        setSearchTxt(v.key);
                        setSelectedProviderKey(v.key);
                        setSelectedProvider(v);
                        message.success('판매사 ' + v.company + '선택완료');
                      }}>{v.company}</p>
                      ) 
                  })}
                </OptionContainer> <br/>
              </>
            :null}
          </>  
        : null}
        {selectedProvider? 
          <>
            <UserInfoBox userInfo={selectedProvider} /> <br/><br/>
          </>
        : null}
        <Title level={4}>정보 입력</Title>
        <UserFormTable>
          <tr>
            <th>아이디</th>
            <th>회사명</th>
            <th>이름</th>
            <th>전화번호</th>
            {isAddrMode?
              <>
                <th>우편번호</th>
                <th>주소</th>
              </>
            : null }
          </tr>
          {userInputs.map((x, i) => {
            if (isAddrMode) {
              return (
                <tr>
                  <td>
                    <input
                      name="key"
                      value={x.key}
                      onChange={(e) => (handleInputChange(e, i))}
                      disabled={isAutoKey}
                      placeholder='숫자, -, 영문(필요시)으로 4~25자 이내'
                      autoComplete="off"
                      maxLength={20}
                    />
                    </td>
                  <td>
                    <input
                      name="company"
                      value={x.company}
                      onChange={(e) => (handleInputChange(e, i))}
                      autoComplete="off"
                      maxLength={20}
                    />
                    </td>
                  <td>
                    <input 
                      name="name"
                      value={x.name}
                      onChange={(e) => (handleInputChange(e, i))}
                      autoComplete="off"
                      maxLength={20}
                    />
                  </td>
                  <td>
                    <input 
                      name="phone"
                      value={x.phone}
                      onChange={(e) => (handleInputChange(e, i))}
                      placeholder=' - 없이 숫자만 입력'
                      maxLength={13}
                      autoComplete="off"
                      required
                    />
                  </td>
                  <td>
                    <input 
                      name="zip"
                      value={x.zip}
                      onChange={(e) => (handleInputChange(e, i))}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input 
                      name="address"
                      value={x.address}
                      onChange={(e) => (handleInputChange(e, i))}
                      autoComplete="off"
                    />
                  </td>
                </tr>
              )
            }
            return (
              <tr>
                <td>
                  <input
                    name="key"
                    value={x.key}
                    onChange={(e) => (handleInputChange(e, i))}
                    disabled={isAutoKey}
                    placeholder='숫자, -, 영문(필요시)으로 4~25자 이내'
                    maxLength={20}
                    required={!isAutoKey}
                  />
                  </td>
                <td>
                  <input
                    name="company"
                    value={x.company}
                    onChange={(e) => (handleInputChange(e, i))}
                    maxLength={20}
                    required
                  />
                  </td>
                <td>
                  <input 
                    name="name"
                    value={x.name}
                    maxLength={20}
                    onChange={(e) => (handleInputChange(e, i))}
                    required
                  />
                </td>
                <td>
                  <input 
                    name="phone"
                    value={x.phone}
                    onChange={(e) => (handleInputChange(e, i))}
                    placeholder=' - 없이 숫자만 입력'
                    maxLength={13}
                    autoComplete="off"
                    required
                  />
                </td>
              </tr>
            )
          })}
        </UserFormTable>
        <Button onClick={onAddField}>+ 입력 필드 추가</Button>
        <Button onClick={onRemoveField}>- 입력 필드 제거</Button>
        <Button onClick={onSetFieldMax}>10개 입력</Button>
        <Button onClick={onInitField}>초기화</Button>
        <br /><br />
        <Button htmlType="submit" loading={loading} type='primary'>회원 생성</Button>
      </form>
      
    </Container1024>
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const key = context.params?.key as string;
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
  if ( response.role !== 'ADMINISTRATOR') { // 관리자권한
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


export default CreateUser;
