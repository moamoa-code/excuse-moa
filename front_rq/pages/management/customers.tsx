// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Descriptions, Table, Modal, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { loadMyInfoAPI, loadUserAPI, addCustomerAPI, deleteCustomerAPI, addItemToCustomerAPI, removeItemToCustomerAPI } from '../../apis/user';
import { loadMyItemsAPI } from '../../apis/item';
import { Container800, DataShow, HGap, MoDal } from '../../components/Styled'; 
import AppLayout from '../../components/AppLayout';
import User from '../../interfaces/user';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../components/MyTable';
import OrderList from '../../components/OrderList';
// import DataShow from '../../components/DataShow';

const Customers = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: myItems } = useQuery('myItems', loadMyItemsAPI);
  const [form] = Form.useForm();
  const [ isCustomerOrdersModal, setIsCustomerOrdersModal ] = useState(false);
  const modalOutside = useRef(); // 모달 바깥부분 클릭시 닫기 위한 ref

  const { Search } = Input;
  const [ userInfo, setUserInfo] = useState({});
  const [ uKey, setUKey ] = useState('');
  const [ uCompany, setUcompany ] = useState('');
  const [ uName, setUname ] = useState('');
  const [ uPhone, setUphone ] = useState('');
  const [ uEmail, setUemail ] = useState('');
  const [ uRole, setUrole ] = useState('');
  const [ uItems, setUitems ] = useState([]);
  const [ isMine, setIsmine ] = useState(false);
  const [ isVisible, setIsvisible ] = useState(false);
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const divRef = useRef<HTMLDivElement>(null);

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  const onSearch = (value) => {
    let key = String(value).replace(' ','');
    console.log(key);
    setLoading(true);
    loadUserAPI(key)
      .then((response) => {
        setUserInfo(response);
        if (myUserInfo.Customers.find((v) => (v.key === response.key))){
          setIsmine(true);
        } else {
          setIsmine(false);
        }
        setUKey(response.key);
        setUcompany(response.company)
        setUname(response.name)
        setUphone(response.phone)
        setUemail(response.email)
        setUrole(response.role)
        if (response.UserViewItems){
          setUitems(response.UserViewItems)
        } else {
          setUitems([])
        }
        form.resetFields();
        setIsvisible(true)
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(false)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onToggleItem = (e) => { // 고객에 열람가능 제품 추가/제거
    console.log('click', e.target.value)
    const itemId = parseInt(e.target.value);
    if (e.target.checked) {
      setLoading(true);
      addItemToCustomerAPI({ itemId: itemId, customerKey: uKey })
      .then(() => {
        
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        queryClient.invalidateQueries('myItems');
        setLoading(false);
        openNotification('고객에 열람가능한 제품을 추가했습니다.');
      });
    } else {
      setLoading(true);
      removeItemToCustomerAPI({ itemId: itemId, customerKey: uKey })
      .then(() => {
        
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        queryClient.invalidateQueries('myItems');
        setLoading(false);
        openNotification('고객에 열람가능한 제품을 제거했습니다.');
      });
    }
  }

  const onViewUserInfo = (key) => () => { // 회원목록의 회원 태그 클릭
    setLoading(true);
    loadUserAPI(String(key))
      .then((response) => {
        setUserInfo(response);
        if (myUserInfo.Customers.find((v) => (v.key === response.key))){
          setIsmine(true);
        } else {
          setIsmine(false);
        }
        setUKey(response.key);
        setUcompany(response.company)
        setUname(response.name)
        setUphone(response.phone)
        setUemail(response.email)
        setUrole(response.role)
        if (response.UserViewItems){
          setUitems(response.UserViewItems)
        } else {
          setUitems([])
        }
        console.log(uItems);
        form.resetFields();
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsvisible(false)
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const onAddCustomer = () => {
    setLoading(true);
    addCustomerAPI({ providerKey: myUserInfo.key, customerKey: uKey})
    .then((response) => {
      openNotification('고객 등록이 완료됐습니다.');
      setUrole('CUSTOMER');
      setIsmine(true);
      console.log(response);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
      queryClient.invalidateQueries('user');
    });
  }

  const onDeleteCustomer = () => {
    setLoading(true);
    deleteCustomerAPI({ providerKey: myUserInfo.key, customerKey: uKey})
    .then((response) => {
      openNotification('고객 해제가 완료됐습니다.');
      setIsmine(false);
      console.log(response);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
      queryClient.invalidateQueries('user');
    });
  }

  const userTableColumns = [
    {
      title: '아이디',
      dataIndex: 'key',
      key: 'key',
      type: 'id',
      render: (text, record) => (
        <span onClick={onViewUserInfo(text)}>{text}</span>
      ),
    }, {
      title: '회사명',
      type: 'title',
      dataIndex: 'company',
      key: 'company',
      render: (text, record) => (
        <span onClick={onViewUserInfo(record.key)}>{text}</span>
      ),
    }, {
      title: '담당자',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
    }, {
      title: '',
      key: 'action',
      type: 'right',
      render: (text, record) => (
        <span onClick={onViewUserInfo(record.key)} style={{color: '#4aa9ff'}}>보기</span>
      ),
    },
  ]

  return (
  <AppLayout>
    <Container800>
    {/* <Modal title="Basic Modal" visible={isCustomerOrdersModal} >
          <OrderList userInfo={userInfo} mode="CUSTOMER"/>
          <div className='close'>
            <Button onClick={() => { setIsCustomerOrdersModal(false) }}>닫기</Button>
          </div>
    </Modal> */}
    {isCustomerOrdersModal?
      <MoDal 
        ref={modalOutside}
        onClick={(e)=>{
          if(modalOutside.current === e.target) {
            setIsCustomerOrdersModal(false)}
        }}
      >
        <div className='contents'>
          <OrderList userInfo={userInfo} mode="CUSTOMER"/>
          <div className='close'>
            <Button onClick={() => { setIsCustomerOrdersModal(false) }}>닫기</Button>
          </div>
        </div>
      </MoDal>
    :null}
      <Head>
        <title>고객 등록</title>
      </Head>
      <Title level={4} >{myUserInfo.company}사의 고객 목록</Title>
      {isMobile?
        <MyTable 
        loading={loading}
        rowKey="id"
        columns={userTableColumns}
        dataSource={myUserInfo?.Customers}
        />
      :      
        <Table
          loading={loading}
          rowKey="id"
          columns={userTableColumns}
          dataSource={myUserInfo?.Customers}
        />
      }
      

      <Title level={4} style={{ marginTop: '30px' }} >회원 검색</Title>
      <Search placeholder="사업자 등록번호(아이디)" onSearch={onSearch} enterButton />
      {isVisible ? 
      <>
        <HGap />
        <DataShow ref={divRef}>
          <h1>검색결과</h1>
          <div className='container'>
            <span className='title'>사업자등록번호</span>
            <span className='data'>{uKey}</span>
          </div>
          <div className='container'>
            <span className='title'>회사명</span>
            <span className='data'>{uKey}</span>
          </div>
          <div className='container'>
            <span className='title'>담당자 성함</span>
            <span className='data'>{uName}</span>
          </div>
          <div className='container'>
            <span className='title'>담당자 전화번호</span>
            <span className='data'>{uPhone}</span>
          </div>
          <div className='container'>
            <span className='title'>담당자 이매일</span>
            <span className='data'>{uEmail}</span>
          </div>
          <div className='container'>
            <span className='title'>담당자 등급</span>
            <span className='data'>{uRole}</span>
          </div>
          <div className='container'>
            <span className='title'>주문목록</span>
            <span className='data'>
              <Button onClick={()=>setIsCustomerOrdersModal(true)}>구매주문</Button>
            </span>

          </div>

            <span className='bigTitle'>열람가능 제품 등록</span>
            <span className='bigData'>
            {isMine ? 
              <Form 
                initialValues={{ // 제품 볼 수 있는 유저 체크
                  'userItems': uItems.map((v) => (v.id)),
                }}
                form={form}
              >
                <Form.Item name="userItems">
                  <Checkbox.Group>
                    <Space size={8} wrap>
                      {myItems? 
                        <>
                          {myItems.map((v, i) => {
                            if (v.scope === 'PRIVATE'){
                              return (
                                <Tag key={i}>
                                  <Checkbox value={v.id} disabled={loading} onClick={onToggleItem}>({v.id}) {v.name}</Checkbox>
                                </Tag>)
                            }
                          })
                          } 
                        </>
                      : null}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              </Form>
            : <p>아직 귀사의 고객이 아닙니다.</p> }
            </span>
        </DataShow>
          {isMine ?
            <Button onClick={onDeleteCustomer} style={{ marginTop: '10px' }} loading={loading}>고객등록 해제</Button>
          : <Button onClick={onAddCustomer} style={{ marginTop: '10px' }} loading={loading}>내 고객으로 등록</Button>}
        </>
      : null}
    </Container800>
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['myItems'], () => loadMyItemsAPI());

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};


export default Customers;
