// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Select, message, Radio, Modal } from 'antd';
import { SearchOutlined, SmileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import DaumPostcode from 'react-daum-postcode';

import { loadMyInfoAPI, createUserAPI, loadUserAPI, loadProvidersAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import useInput from '../../../hooks/useInput';
import User from '../../../interfaces/user';
import { Block, ContainerMid, MoDal, OptionContainer, Red, SearchBlock } from '../../../components/Styled';

const CreateUser = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const [providerKey, setProviderKey] = useState('');
  const [selectedProviderKey, setSelectedProviderKey] = useState('');
  const [form] = Form.useForm();
  const [ searchTxt, onChangeSearchTxt, setSearchTxt ] = useInput('');
  const { Option } = Select;
  const [key, setKey] = useState('');
  const [role, setRole] = useState('PROVIDER');
  const [company, onChangeCompany, setCompany] = useInput('');
  const [name, onChangeName, setName] = useInput('');
  const [phone, setPhone] = useState('');
  const [email, onChangeEmail, setEmail] = useInput('');
  const [password, setPassword] = useState('123123');
  const [hqNumber, onChangeHq, setHqNumber] = useInput('');
  const [passwordCheck, setPasswordCheck] = useState('123123');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordValidError, setPasswordValidError] = useState(false);
  const [keyValidError, setKeyValidError] = useState(false);
  const [phoneValidError, setPhoneValidError] = useState(false);
  const [disableBtn, setDisableBtn] = useState(true);
  const [isProviderList, setIsproviderList] = useState(false);

  const [ isVisible, setIsVisible ] = useState(false);
  const [ zip, setZip ] = useState('');
  const [ address, onChangeAddress, setAddress ] = useInput<string>('');
  const [ address2, onChangeAddress2, setAddress2 ] = useInput<string>('');
  const modalOutside = useRef(); // 모달 바깥부분 클릭시 닫기 위한 ref

  useEffect(() => { // 유효성 검사완료시 가입버튼 활성화
    if (keyValidError || phoneValidError || passwordValidError || passwordError || passwordCheck === '' || company === '' || name === ''){
      setDisableBtn(true);
    } else {
      setDisableBtn(false);
    }
  }, [keyValidError, phoneValidError, passwordCheck, passwordValidError, passwordError, name, company])

  const onChangeKey = useCallback( // 아이디 유효성검사
    (e) => {
      const regExpId = /^[A-Za-z0-9-@.]{4,25}$/;
      setKey(e.target.value);
      setKeyValidError(!regExpId.test(e.target.value));
    },
    [key],
  );

  const onChangePhone = useCallback( // 연락처 유효성검사
    (e) => {
      const { value } = e.target;
      const onlyNumber = value.replace(/[^0-9]/g, '');
      // const regExpPhone = /[^0-9]/;
      setPhone(onlyNumber);
      // setPhoneValidError(!regExpPhone.test(e.target.value));
    },
    [phone],
  );

  const onChangePassword = useCallback( // 비밀번호 유효성검사
    (e) => {
      const regExpPw = /^[A-Za-z0-9`~_!@#$%^&*()_+=,.></?-]{6,15}$/;
      setPassword(e.target.value);
      setPasswordValidError(!regExpPw.test(e.target.value));
    },
    [password],
  );

  const onChangePasswordCheck = useCallback(  // 비밀번호확인 검사
    (e) => {
      setPasswordCheck(e.target.value);
      setPasswordError(e.target.value !== password);
    },
    [passwordCheck],
  );

  const handleRoleChange = (value) => {
    setRole(value);
    if (value === 'PROVIDER' || 'NOVICE') {
      setSelectedProviderKey('');
    }
  }

  const showModal = () => {
    setIsVisible(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const onCompletePost = (data) => {
    let fullAddr = data.address;
    let extraAddr = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddr += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddr += extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddr += extraAddr !== '' ? ` (${extraAddr})` : '';
    }

    setZip(data.zonecode);
    setAddress(fullAddr);
    setIsVisible(false);
  };


  const openNotification = (response) => {
    notification.open({
      message: `${response.company} 고객생성이 완료됐습니다.`,
      description:
        `${response.name}님, 아이디 ${response.key}`,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 8,
    });
  };

  const onSubmit = useCallback(() => {
    setLoading(true);
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (role === 'CUSTOMER') {
      if (selectedProviderKey === '' || selectedProviderKey === null){
        return message.error('판매자를 선택해 주세요.')
      }
    }
    let fullAddress = '';
    let addrData = {};
    if (zip !== '') {
      if (address === '' || address2 === '') {
        return message.error('상세주소를 작성해주세요.')
      }
      fullAddress = address + ' ' + address2;
      addrData = { zip, address : fullAddress }
    }    
    createUserAPI({ providerKey: selectedProviderKey, role, key, password, company, name, phone, email, hqNumber, addrData })
      .then((response) => {
        openNotification(response);
        if (role !== 'CUSTOMER') {
          setSearchTxt('');
          setProviderKey('');
          setSelectedProviderKey('');
          setIsproviderList(false);
        }
        form.resetFields();
        setZip('');
        setAddress('');
        setAddress2('');
        setHqNumber('');
        setKey('');
        setCompany('');
        setName('');
        setPhone('');
        setEmail('');
        setPassword('123123');
        setPasswordCheck('123123');
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries('user'); // 카트 목록 다시 불러오기
        queryClient.invalidateQueries('userList');
      });
  }, [key, role, selectedProviderKey, password, company, name, phone, email, passwordCheck, hqNumber, zip, address, address2]);

  const onSearchClick = () => {
    if (searchTxt === '') {
      return message.error('값을 입력해주세요.')
    }
    setLoading(true);
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


  return (
  <AppLayout>
    <ContainerMid>
      <Head>
        <title>회원 생성</title>
      </Head>
      <Title level={3}>회원 생성</Title>
      <Form onFinish={onSubmit} form={form}>
        <Block>
          <label><Red>* </Red>회원 구분</label>
          <Select
            onChange={handleRoleChange}
            defaultValue={role}
          >
            <Option value='PROVIDER'>판매자</Option>
            <Option value='CUSTOMER'>구매자</Option>
            <Option value='NOVICE'>비회원</Option>
          </Select>
        </Block>
        {role === 'CUSTOMER'?
        <>
          <label style={{margin: '0 0 7px 0'}}>판매자 선택</label>
          <SearchBlock>
            <div>
              <input
                value={searchTxt}
                onChange={onChangeSearchTxt}
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
          {isProviderList?
            <OptionContainer>
            {providerList?.map((v)=>{
              return (
                <p className='provider' onClick={() => {
                  setSearchTxt(v.key);
                  setSelectedProviderKey(v.key);
                  message.success('판매사 ' + v.company + '선택완료');
                }}>{v.company}</p>
                ) 
            })}
          </OptionContainer>
          :null}
        </>  
        : null}
        <Block>
          <label><Red>* </Red>사업자등록번호 또는 ID</label>
          <input
            value={key}
            onChange={onChangeKey}
            placeholder=' - 포함하여 작성해주세요.'
            required
            autoComplete="off"
          />
        </Block>
        {keyValidError && <Red>숫자, -, 영문(필요시)으로 4~25자 이내</Red>}
        <Block>
          <label>본사 사업자등록번호</label>
          <input
            value={hqNumber}
            onChange={onChangeHq}
            placeholder='필요시만 입력'
            maxLength={25}
            autoComplete="off"
          />
        </Block>
        <Block>
          <label><Red>* </Red>회사명 또는 성함</label>
          <input
            value={company}
            onChange={onChangeCompany}
            maxLength={12}
            placeholder='12자 이내'
            required
            autoComplete="off"
          />
        </Block>
        <Block>
          <label><Red>* </Red>담당자 성함</label>
          <input
            value={name}
            onChange={onChangeName}
            maxLength={12}
            required
            autoComplete="off"
          />
        </Block>
        <Block>
          <label><Red>* </Red>담당자 연락처</label>
          <input
            value={phone}
            onChange={onChangePhone}
            placeholder=' - 없이 숫자만 입력'
            maxLength={13}
            autoComplete="off"
            required
          />
        </Block>
        <Block>
          <label>담당자 이메일</label>
          <input
            type="email"
            value={email}
            onChange={onChangeEmail}
            autoComplete="off"
            autoCapitalize="no"
          />
        </Block>
        <Block>
          <label><Red>* </Red>비밀번호</label>
          <input
            name="user-password"
            type="password"
            value={password}
            required
            onChange={onChangePassword}
            placeholder='6자 이상 15자 이하'
            autoComplete="no"
          />
        </Block>
        {passwordValidError && <Red>6자 이상 15자 이하로 입력해 주세요.</Red>}
        <Block>
          <label><Red>* </Red>비밀번호 확인</label>
          <input
            name="user-password-check"
            type="password"
            value={passwordCheck}
            required
            placeholder='6자 이상 15자 이하'
            onChange={onChangePasswordCheck}
            autoComplete="off"
          />
        </Block>
        {passwordError && <Red>비밀번호가 일치하지 않습니다.</Red>}
        <Block>
          <label>주소 입력 (필요시)</label>
        </Block>
        <Button type="primary" onClick={showModal}>
            우편번호 찾기
          </Button>
        <Block>
          <label>우편번호</label>
          <input
            value={zip}
            placeholder='우편번호 찾기를 통해 입력해주세요.'
            readOnly
          />
        </Block>
        <Block>
          <label>주소</label>
          <input
            value={address}
            placeholder='우편번호 찾기를 통해 입력해주세요.'
            readOnly
          />
        </Block>
        <Block>
          <label>주소 상세</label>
          <input
            value={address2}
            onChange={onChangeAddress2}
            placeholder=''
          />
        </Block>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={disableBtn}>
            회원생성
          </Button>
        </div>
      </Form>
      <br/><br/>
      {isVisible?
        <MoDal 
          ref={modalOutside}
          onClick={(e)=>{
            if(modalOutside.current === e.target) {
              setIsVisible(false)}
          }}
        >
          <div className='contents'>
            <DaumPostcode onComplete={onCompletePost } />
            <div className='close'>
              <Button onClick={() => { setIsVisible(false) }}>닫기</Button>
            </div>
          </div>
        </MoDal>
      :null}
      {/* <Modal
        visible={isVisible}
        onCancel={handleCancel}
        footer={[
          <Button onClick={handleCancel}>
            닫기
          </Button>,
        ]}
        >
          <DaumPostcode onComplete={onCompletePost } />
      </Modal> */}
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


export default CreateUser;
