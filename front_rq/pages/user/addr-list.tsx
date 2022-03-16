// @ts-nocheck
// -> UseRef 문제 해결 못함
import React, { useRef, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import { loadAddrsAPI, loadMyInfoAPI, registAddrAPI, removeAddrAPI } from '../../apis/user';
import User from '../../interfaces/user';
import AddressList from '../../components/AddressList';
import { Button, Descriptions, Divider, notification, Typography } from 'antd';
import styled from 'styled-components';
import { SmileOutlined } from '@ant-design/icons';

const Container500 = styled.div`
  max-width: 500px;
  margin 0 auto;
  padding: 10px;
`


const AddrList = () => {
  const childRef = useRef();
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI, {
    onSuccess: (data) => {
      console.log(data.id);
      loadAddrsAPI(data.id)
      .then((response) => {
        setAddrs(response);
      })
      .catch((error) => {
        alert(error.response.data);
      })
    }
  });
  const [ loading, setLoading ] = useState(false);
  const [ id, setId ] = useState();
  const [ addrs, setAddrs ] = useState([{}]);
  const [ name, setName ] = useState('');
  const [ phone, setPhone ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ zip, setZip ] = useState('');
  const { Title } = Typography;
  // const { data } = useQuery('addrs', loadAddrsAPI, {
  //   onSuccess: (data) => {
  //     console.log(data);
  //     setAddrs(data);
  //   }
  // });

  const openNotification = () => {
    notification.open({
      message: `주소 삭제가 완료되었습니다.`,
      description:
        ``,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 4,
    });
  };

  const onRemoveAddr = () => {
    setLoading(true);
    removeAddrAPI({id})
    .then(() => {
      queryClient.invalidateQueries('user');
      openNotification();
      childRef.current.setInit();
    })
    .finally(() => {
      setLoading(false);
    })
  }

  return (
    <AppLayout>
      <Container500>
        <Divider><Title level={4}>내 주소 목록</Title></Divider><br />
        <AddressList ref={childRef} addrs={addrs} setId={setId} setName={setName} setPhone={setPhone} setAddress={setAddress} setZip={setZip}/>
        <br />
        {id? <Button loading={loading} onClick={onRemoveAddr} type='dashed' danger>주소 삭제</Button>
        : null}
        
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
        destination: '/',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI);
  await queryClient.prefetchQuery(['addrs'], () => loadAddrsAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default AddrList;