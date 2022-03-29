import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, 
  Space, Tag, Descriptions, Table, Select, message, Popconfirm } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';

import { loadMyInfoAPI, loadUserAPI, addCustomerAPI, 
  deleteCustomerAPI, addItemToCustomerAPI, 
  removeItemToCustomerAPI, loadAllUserListAPI, updateUserRoleAPI, updateUserAPI, changePasswordAPI, loadProvidersAPI, loadProviderAPI } from '../../../apis/user';
import { loadItemListAPI, loadMyItemsAPI } from '../../../apis/item';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import useInput from '../../../hooks/useInput';

const ErrorMessage = styled.div`
  color: red;
`;

const ProviderList = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: userList } = useQuery('userList', loadProvidersAPI);
  const [form] = Form.useForm();

  const [selectedProvider, setSelectedProvider] = useState<any>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>('');
  const [itemsOfProvider, setItemsOfProvider] = useState<any>([]);

  const { Search } = Input;
  const [ isVisible, setIsvisible ] = useState(false);
  const [ isCustomerSelected, setIsCustomerSelected ] = useState(false);
  const [ isMember, setIsMember ] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const { Option } = Select;

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  const onSearchProvider = (value) => {
    console.log(value);
    setLoading(true);
    setIsvisible(false);
    loadUserAPI(String(value).trim())
      .then((response) => {
        if (response.role !== 'PROVIDER') {
          return message.error('판매자 회원이 아닙니다.');
        }
        setSelectedProvider(response);
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSearchCustomer = (value) => {
    setLoading(true);
    setIsvisible(false);
    loadUserAPI(String(value).trim())
      .then((response) => {
        setSelectedCustomer(response);
        setIsCustomerSelected(true);
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onViewUserInfo = (id) => () => { // 회원정보 보기
    setIsvisible(false);
    setLoading(true);
    loadProviderAPI(String(id))
      .then((response) => {
        setSelectedProvider(response);
        setIsCustomerSelected(false);
        setSelectedCustomer('');
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsvisible(false);
      })
      .finally(() => {
        setLoading(false);
      });
    loadItemListAPI(String(id))
    .then((response) => {
      setItemsOfProvider(response);
      console.log('판매자:',response);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
      setIsvisible(false);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  
  const onCustomerSelect = (id) => () => { // 회원목록의 회원 태그 클릭
    setLoading(true);
    loadUserAPI(String(id))
      .then((response) => {
        setSelectedCustomer(response);
        if (selectedProvider.Customers.find((v) => (v.id === response.id))){
          setIsMember(true);
        } else {
          setIsMember(false);
        }
        setIsCustomerSelected(true);
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsCustomerSelected(false);
      })
      .finally(() => {
        setLoading(false);
        form.resetFields();
      });
  };

  
  const onToggleItem = (e) => { // 고객에 열람가능 제품 추가/제거
    console.log('click', e.target.value)
    const itemId = parseInt(e.target.value);
    if (e.target.checked) {
      setLoading(true);
      addItemToCustomerAPI({ itemId: itemId, customerId: selectedCustomer.id})
      .then(() => {
        
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        queryClient.invalidateQueries('myItems');
        setLoading(false);
        openNotification('고객에 열람가능한 제품을 추가했습니다.');
      });
    } else {
      setLoading(true);
      removeItemToCustomerAPI({ itemId: itemId, customerId: selectedCustomer.id })
      .then(() => {
        
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        queryClient.invalidateQueries('myItems');
        setLoading(false);
        openNotification('고객에 열람가능한 제품을 제거했습니다.');
      });
    }
  }

  
  const onAddCustomer = () => {
    setLoading(true);
    setIsvisible(false);
    addCustomerAPI({ providerId: selectedProvider.id, customerId: selectedCustomer.id })
    .then((response) => {
      openNotification('고객 등록이 완료됐습니다.');
      setIsvisible(true);
      setIsMember(true);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const onDeleteCustomer = () => {
    setLoading(true);
    setIsvisible(false);
    deleteCustomerAPI({ providerId: selectedProvider.id, customerId: selectedCustomer.id })
    .then((response) => {
      openNotification('고객 해제가 완료됐습니다.');
      setIsvisible(true);
      setIsMember(false);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }


  const userTableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <b><p onClick={onViewUserInfo(text)}>{text}</p></b>
      ),
    },
    {
      title: '회사명',
      dataIndex: 'company',
      key: 'company'
    },{
      title: '회원구분',
      key: 'role',
      dataIndex: 'role',
      filters: [
        {
          text: '판매자',
          value: 'PROVIDER'
        }, {
          text: '구매자',
          value: 'CUSTOMER'
        }, {
          text: '비회원',
          value: 'NOVICE'
        }, {
          text: '탈퇴요청',
          value: 'RESIGNED'
        }
      ],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
    },
    {
      title: '담당자',
      dataIndex: 'name',
      key: 'name',
    },
  ]

  return (
  <AppLayout>
    <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
      <Head>
        <title>판매회원 관리</title>
      </Head>
      <Title level={4} >판매회원 관리</Title>
      <Table
        size="small"
        rowKey="id"
        columns={userTableColumns}
        dataSource={userList}
      />
      <Title level={4} style={{ marginTop: '30px' }} >판매자 검색</Title>
      <Search placeholder="ID / 사업자 등록번호" onSearch={onSearchProvider} enterButton />
      {isVisible ? 
        <div id={'editForm'} ref={divRef}>
          <br/>
          <span style={{fontSize:'15pt', fontWeight:'bold'}}>판매자 상세정보 </span>
          <br />
          <Descriptions 
            style={{ marginTop: '30px' }}
            bordered
          >
            <Descriptions.Item label="ID/사업자번호" span={2}>
              {selectedProvider?.id}
            </Descriptions.Item>
            <Descriptions.Item label="회사명" span={2}>
              {selectedProvider?.company}
            </Descriptions.Item>
            <Descriptions.Item label="담당자 성함" span={2}>
              {selectedProvider?.name}
            </Descriptions.Item>
            <Descriptions.Item label="담당자 전화번호" span={2}>
              {selectedProvider?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="담당자 이메일" span={2}>
              {selectedProvider?.email}
            </Descriptions.Item>
            <Descriptions.Item label="회원구분" span={2}>
              {selectedProvider?.role}
            </Descriptions.Item>
          </Descriptions><br />
          <span style={{fontSize:'15pt', fontWeight:'bold'}}>{selectedProvider?.company}의 고객목록</span><br /><br />
          <Space>
          {selectedProvider.Customers.map((v) => (
            <>
              {/* {printTags(myUserInfo.Customers, v)} */}
              <Tag color="blue" onClick={onCustomerSelect(v.id)}>{v.company} / {v.name}</Tag>
            </>
          ))}
          </Space>
          <Title level={4} style={{ marginTop: '30px' }} >구매자 검색</Title>
          <Search placeholder="ID / 사업자 등록번호" onSearch={onSearchCustomer} enterButton />
          {isCustomerSelected ? 
          <>
            <Title level={4} style={{ marginTop: '30px' }} >구매회원 정보</Title>
            <Descriptions style={{ marginTop: '30px' }} bordered>
              <Descriptions.Item label="사업자등록번호">{selectedCustomer?.id}</Descriptions.Item>
              <Descriptions.Item label="회사명">{selectedCustomer?.company}</Descriptions.Item>
              <Descriptions.Item label="담당자 성함">{selectedCustomer?.name}</Descriptions.Item>
              <Descriptions.Item label="담당자 전화번호">{selectedCustomer?.phone}</Descriptions.Item>
              <Descriptions.Item label="담당자 이메일">{selectedCustomer?.email}</Descriptions.Item>
              <Descriptions.Item label="등급">{selectedCustomer?.role}</Descriptions.Item>
            </Descriptions><br />
            {isMember ?
              <Popconfirm
                title="고객 등록을 해제하시겠습니까?"
                okText="해제"
                cancelText="취소"
                onConfirm={onDeleteCustomer}
              >
                <Button loading={loading}>고객 등록 해제</Button>
              </Popconfirm>
            : 
              <Popconfirm
                title="고객으로 등록하시겠습니까?"
                okText="등록"
                cancelText="취소"
                onConfirm={onAddCustomer}
              >
                <Button loading={loading}>{selectedProvider?.company}의 고객으로 등록</Button>
              </Popconfirm>
            }<br /><br />
            <span style={{fontSize:'15pt', fontWeight:'bold'}}>{selectedCustomer?.company}의 열람가능한 제품 등록</span><br /><br />  
            <Form 
              initialValues={{ // 제품 볼 수 있는 유저 체크
                'userItems': selectedCustomer?.UserViewItems?.map((v) => (v.id)),
              }}
              form={form}
            >
              <Form.Item name="userItems">
                <Checkbox.Group>
                  <Space size={8} wrap>
                    {itemsOfProvider? 
                      <>
                        {itemsOfProvider.map((v) => (
                          <Tag><Checkbox value={v.id} disabled={loading} onClick={onToggleItem}>({v.id}) {v.name} {v.packageName} {v.unit}</Checkbox></Tag>
                        ))
                        } 
                      </>
                    : null}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Form>
        </>
        : null}
        </div>
      :null}
    </div>
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


export default ProviderList;
