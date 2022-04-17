// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Descriptions, Table } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { loadMyInfoAPI, loadUserAPI, addCustomerAPI, deleteCustomerAPI, addItemToCustomerAPI, removeItemToCustomerAPI } from '../../apis/user';
import { loadMyItemsAPI } from '../../apis/item';
import AppLayout from '../../components/AppLayout';
import User from '../../interfaces/user';

const Customers = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: myItems } = useQuery('myItems', loadMyItemsAPI);
  const [form] = Form.useForm();

  const { Search } = Input;
  const [ uKey, setUKey ] = useState('');
  const [ uCompany, setUcompany ] = useState('');
  const [ uName, setUname ] = useState('');
  const [ uPhone, setUphone ] = useState('');
  const [ uEmail, setUemail ] = useState('');
  const [ uRole, setUrole ] = useState('');
  const [ uItems, setUitems ] = useState([]);
  const [ isMine, setIsmine ] = useState(false);
  const [ isVisible, setIsvisible ] = useState(false);

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
    console.log(value);
    setLoading(true);
    loadUserAPI(String(value))
      .then((response) => {
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
        alert(error.response.data);
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
        console.log(response);
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
      render: (text, record) => (
        <b><p onClick={onViewUserInfo(text)}>{text}</p></b>
      ),
    }, {
      title: '회사명',
      dataIndex: 'company',
      key: 'company'
    }, {
      title: '담당자',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
    },
  ]

  return (
  <AppLayout>
    <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
      <Head>
        <title>고객 등록</title>
      </Head>
      <Title level={4} >{myUserInfo.company}사의 고객 목록</Title>
      <Table
        loading={loading}
        size="small"
        rowKey="id"
        columns={userTableColumns}
        dataSource={myUserInfo?.Customers}
      />
      <Title level={4} style={{ marginTop: '30px' }} >회원 검색</Title>
      <Search placeholder="사업자 등록번호" onSearch={onSearch} enterButton />
      {isVisible ? 
        <div ref={divRef}>
          <Descriptions title="검색결과" style={{ marginTop: '30px' }} bordered>
            <Descriptions.Item label="사업자등록번호">{uKey}</Descriptions.Item>
            <Descriptions.Item label="회사명">{uCompany}</Descriptions.Item>
            <Descriptions.Item label="담당자 성함">{uName}</Descriptions.Item>
            <Descriptions.Item label="담당자 전화번호">{uPhone}</Descriptions.Item>
            <Descriptions.Item label="담당자 이메일">{uEmail}</Descriptions.Item>
            <Descriptions.Item label="등급">{uRole}</Descriptions.Item>
            <Descriptions.Item label="열람가능 제품 등록" span={3}>
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
                          {myItems.map((v) => {
                            if (v.scope === 'PRIVATE'){
                              return (
                                <Tag>
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
            </Descriptions.Item>
          </Descriptions>
          {isMine ?
            <Button onClick={onDeleteCustomer} style={{ marginTop: '10px' }} loading={loading}>고객등록 해제</Button>
          : <Button onClick={onAddCustomer} style={{ marginTop: '10px' }} loading={loading}>내 고객으로 등록</Button>}
        </div>
      : null}
    </div>
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
