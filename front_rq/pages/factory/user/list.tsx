import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Button, notification, 
  Space, Descriptions, Table, Select, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import styled from 'styled-components';
import dayjs from 'dayjs';

import { loadMyInfoAPI, loadUserAPI, loadAllUserListAPI, 
  updateUserRoleAPI, updateUserAPI, changePasswordAPI } from '../../../apis/user';
import { loadMyItemsAPI } from '../../../apis/item';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import useInput from '../../../hooks/useInput';
import Link from 'next/link';

const ErrorMessage = styled.div`
  color: red;
`;

const UserList = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: myItems } = useQuery('myItems', loadMyItemsAPI);
  const { data: userList } = useQuery('userList', loadAllUserListAPI);
  const [form] = Form.useForm();

  const { Search } = Input;
  const [ uId, setUid ] = useState('');
  const [ uCompany, onChangeUcompany, setUcompany ] = useInput('');
  const [ uName, onChangeUname, setUname ] = useInput('');
  const [ uPhone, onChangeUphone, setUphone ] = useInput('');
  const [ uEmail, onChangeUemail, setUemail ] = useInput('');
  const [ password, onChangePassword, setPassword ] = useInput('');
  const [ uRole, setUrole ] = useState('');
  const [ uItems, setUitems ] = useState([]);
  const [ uDate, setUdate ] = useState('');
  const [ isMine, setIsmine ] = useState(false);
  const [ isVisible, setIsvisible ] = useState(false);
  const [ isEditable, setIsEditable ] = useState(false);
  const [ isPasswordEdit, setIsPasswordEdit ] = useState(false);
  const [ uRoleToChange, setUroleToChange ] = useState('');
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

  const onSearch = (value) => {
    console.log(value);
    setLoading(true);
    setIsvisible(false);
    loadUserAPI(String(value).trim())
      .then((response) => {
        if (myUserInfo.Customers.find((v) => (v.id === response.id))){
          setIsmine(true);
        } else {
          setIsmine(false);
        }
        setUid(response.id);
        setUcompany(response.company);
        setUname(response.name);
        setUphone(response.phone);
        setUemail(response.email);
        setUrole(response.role);
        setUroleToChange(response.role);
        setUdate(response.createdAt);
        setPassword('');
        setIsPasswordEdit(false);
        if (response.UserViewItems){
          setUitems(response.UserViewItems)
        } else {
          setUitems([])
        }
        form.resetFields();
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const onViewUserInfo = (id) => () => { // 회원정보 보기
    setIsvisible(false);
    setLoading(true);
    loadUserAPI(String(id))
      .then((response) => {
        if (myUserInfo.Customers.find((v) => (v.id === response.id))){
          setIsmine(true);
        } else {
          setIsmine(false);
        }
        setUid(response.id);
        setUcompany(response.company);
        setUname(response.name);
        setUphone(response.phone);
        setUemail(response.email);
        setUrole(response.role);
        setUdate(response.createdAt);
        setUroleToChange(response.role);
        setPassword('');
        setIsPasswordEdit(false);
        if (response.UserViewItems){
          setUitems(response.UserViewItems);
        } else {
          setUitems([]);
        }
        console.log(uItems);
        form.resetFields();
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
  };

  const handleRoleChange = (value) => {
    setUroleToChange(value);
  }

  const onReqChangeRole = () => {
    setLoading(true);
    if (uRoleToChange === '' || uId === ''){
      message.error('선택 안한 항목이 있습니다.');
    }
    const data = {userId: uId, role: uRoleToChange};
    updateUserRoleAPI(data)
    .then((response) => {
      message.success('회원구분 변경을 완료했습니다.');
      queryClient.invalidateQueries('userList');
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
      setIsvisible(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const onReqUserEdit= () => {
    setLoading(true);
    const data = {userId: uId, company:uCompany, role: uRoleToChange, name: uName, phone: uPhone, email: uEmail};
    updateUserAPI(data)
    .then((response) => {
      message.success('회원정보 수정을 완료했습니다.');
      queryClient.invalidateQueries('userList');
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
      setIsvisible(false);
    })
    .finally(() => {
      setLoading(false);
      setIsEditable(false);
    });
  }

  const onReqChangePassword= () => {
    setLoading(true);
    const regExpPw = /^[A-Za-z0-9`~_!@#$%^&*()_+=,.></?-]{6,15}$/;
    if (!regExpPw.test(password)){
      return message.error('6자 이상 15자 이하로 입력해 주세요.');
    }
    const data = { userId: uId, password };
    changePasswordAPI(data)
    .then((response) => {
      message.success('비밀번호를 변경 했습니다.');
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
        <title>고객 등록</title>
      </Head>
      <Title level={4} >{myUserInfo.company}회원 목록</Title>
      <Table
        size="small"
        rowKey="id"
        columns={userTableColumns}
        dataSource={userList}
      />
      <Title level={4} style={{ marginTop: '30px' }} >회원 검색</Title>
      <Search placeholder="ID / 사업자 등록번호" onSearch={onSearch} enterButton />
      {isVisible ? 
        <div id={'editForm'} ref={divRef}>
          <br/>
          <span style={{fontSize:'15pt', fontWeight:'bold'}}>회원 정보 </span>
          <Button
            onClick={() => {
              setIsEditable(!isEditable);
            }}
          >
            수정모드
          </Button>
          <br />
          <Descriptions 
            style={{ marginTop: '30px' }}
            bordered
          >
            <Descriptions.Item label="ID/사업자번호" span={2}>
              {uId}
            </Descriptions.Item>
            <Descriptions.Item label="회사명" span={2}>
              {isEditable?
                <input
                  value={uCompany}
                  onChange={onChangeUcompany}
                />
                :
                <input
                  value={uCompany}
                  onChange={onChangeUcompany}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="담당자 성함" span={2}>
              {isEditable?
                <input
                  value={uName}
                  onChange={onChangeUname}
                />
                :
                <input
                  value={uName}
                  onChange={onChangeUname}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="담당자 전화번호" span={2}>
              {isEditable?
                <input
                  value={uPhone}
                  onChange={onChangeUphone}
                />
                :
                <input
                  value={uPhone}
                  onChange={onChangeUphone}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="담당자 이메일" span={2}>
              {isEditable?
                <input
                  value={uEmail}
                  onChange={onChangeUemail}
                />
                :
                <input
                  value={uEmail}
                  onChange={onChangeUemail}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="회원구분" span={2}>
              <Space>
                <Select
                  onChange={handleRoleChange}
                  defaultValue={uRole}
                >
                  <Option value='PROVIDER'>판매자</Option>
                  <Option value='CUSTOMER'>구매자</Option>
                  <Option value='NOVICE'>비회원</Option>
                  <Option value='RESIGNED'>회원탈퇴</Option>
                </Select>
                {isEditable?
                    null
                  :
                  <Button onClick={onReqChangeRole} type='primary'> 
                    변경하기
                  </Button>
                }
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="가입일자" span={2}>
                {dayjs(uDate).format('YYYY/MM/DD HH:mm')}
            </Descriptions.Item>
          </Descriptions><br />
          <Space>
            {isEditable?
              <Button type='primary' onClick={onReqUserEdit}>회원정보 수정</Button>
              : null
            }
            {isPasswordEdit?
              <>
                <input 
                  type='password'
                  value={password}
                  onChange={onChangePassword}
                  placeholder='6자 이상 15자 이하'
                />
                <Button
                  onClick={onReqChangePassword}
                  type='primary'
                >
                  변경완료
                </Button>
              </>
              :
              <Button
              onClick={()=>{
                setIsPasswordEdit(!isPasswordEdit);
              }}
              >
                비밀번호 변경
              </Button>
            }
            <Button danger>회원 삭제</Button>
          </Space>
        </div>
      : null}<br/>
      <Link href='/factory/user/create'><a><Button type='primary'>+ 회원 생성</Button></a></Link>
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


export default UserList;
