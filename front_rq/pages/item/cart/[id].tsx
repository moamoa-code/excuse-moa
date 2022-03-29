// @ts-nocheck
// -> AddressList.tsx UseRef 문제 해결 못함
// 카트에 담긴 제품 불러오기 / 주문하기
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, NewLifecycle } from 'react';
import { Button, Table, notification, InputNumber, Form, Typography, Input } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadAddrsAPI, loadMyInfoAPI } from '../../../apis/user';
import { loadCartAPI, removeCartAPI } from '../../../apis/item';
import { orderItemAPI } from '../../../apis/order';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import Item from '../../../interfaces/item';
import { DeleteOutlined } from '@ant-design/icons';
import useInput from '../../../hooks/useInput';
import AddressList from '../../../components/AddressList';
import styled from 'styled-components';

const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

const ViewCartItems = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { Title } = Typography;
  // const queryClient = useQueryClient();
  const { id } = router.query; // 유저 id
  // const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
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
  const { data: cartItems } = useQuery<Item[]>('cartItems', () => loadCartAPI(String(id)));
  const [ loading, setLoading ] = useState(false);
  const [ theMap, setTheMap ] = useState<Map<number,{qty:number, tag:string|null}>>(new Map());
  const [ comment, onChangeComment ] = useInput('');
  const [ addrId, setId ] = useState();
  const [ addrs, setAddrs ] = useState([{}]); // 주소 목록
  const [ name, setName ] = useState(''); // 서버에 보낼 주소 데이터
  const [ phone, setPhone ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ zip, setZip ] = useState('');
  // const { data } = useQuery('addrs', loadAddrsAPI, {
  //   onSuccess: (data) => {
  //     console.log('onSuccess');
  //     setAddrs(data);
  //   }
  // });

  const openNotification = () => {
    notification['success']({
      message: '장바구니에서 상품을 제거했습니다.',
      placement: 'topLeft',
      duration: 1,
    });
  };

  const onChangeQty = (target) => (value) => { // 수량 변경
    let tag = '';
    if (theMap.has(target)) {
      tag = theMap.get(target).tag;
      console.log('theMap.get(target).tag',theMap.get(target).tag)
    }
    setTheMap((prev) => new Map(prev).set(target, { qty: value, tag }));
    console.log(theMap);
  }

  const onChangeTag = (target) => (value) => { // 표기사항 변경
    let qty = 1;
    if (theMap.has(target)) {
      qty = theMap.get(target).qty;
      console.log('theMap.get(target).qty',theMap.get(target).qty);
    }
    const tag = value.target.value;
    console.log('value.target.value',value.target.value);
    setTheMap((prev) => new Map(prev).set(target, { qty: qty, tag: tag }));
  }

  const onSubmit = () => { // 주문하기
    const newMap = new Map(theMap);
    const userId = String(id);
    cartItems.map((item) => { // 맵에 수량 없으면 1로 채우기
      if (!theMap.has(item.id)) {
        newMap.set(item.id,{qty:1, tag:''});
      }
    });
    console.log('after', newMap);
    setTheMap(newMap);
    const items = Object.fromEntries(newMap); // back에서 받기위해 형변환
    orderItemAPI({ items, comment, userId, zip, address, name, phone })
    .then((result) => {
      console.log(result);
      router.replace(`/item/order/${result}`);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const mutation = useMutation<void, AxiosError, { itemId: number, userId: string }>(removeCartAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: (result) => {
      openNotification();
      queryClient.invalidateQueries('cartItems'); // 카트 목록 다시 불러오기
      setTheMap((prev) => { // 해시맵에서 제거한 제품 키 제거
        const newMap = new Map(prev);
        newMap.delete(Number(result));
        return newMap;
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onClickRemove = (id) => () => { // 장바구니에서 제품 제거
      const itemId = id;
      const userId = myUserInfo.id;
      mutation.mutate({ itemId,  userId });
  };

  const columns = [
    {
      title: '제품명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <>{text}</>
      ),
    },
    {
      title: '포장종류',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: '무게단위',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '공급가',
      key: 'supplyPrice',
      dataIndex: 'supplyPrice',
    }, {
      title: '표기사항',
      key: 'action',
      render: (text, record) => (
        <Input
          style={{ maxWidth:'120px'}}
          size='large'
          onChange={onChangeTag(record.id)}
        />
      ),
    },
    {
      title: '수량',
      key: 'action',
      render: (text, record) => (
        <InputNumber 
          style={{ maxWidth:'50px'}}
          size='large'
          min={1}
          defaultValue={1}
          onChange={onChangeQty(record.id)} />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (text, record) => (
        <Button
        icon={<DeleteOutlined style={{ color: '#f4f4f', fontSize: '16pt'}}/>}
          loading={loading}
          onClick={onClickRemove(record.id)}
        ></Button>
      ),
    },
  ]

  return (
    <AppLayout>
      <Container800>
        <Title level={4}>장바구니</Title>
        <Form onFinish={onSubmit}>
          <Table 
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={cartItems}
          />
          <br />
          <Title level={4}>배송지 입력</Title>
          <AddressList setId={setId} addrs={addrs} setName={setName} setPhone={setPhone} setAddress={setAddress} setZip={setZip}/>
          <br />
          <Form.Item label="기타 요구사항">
            <Input.TextArea 
              name="user-price" 
              value={comment}
              onChange={onChangeComment} />
          </Form.Item>
          <Button htmlType="submit" style={{ display:'block', margin: '20px auto' }} type="primary" >주문하기</Button>
        </Form>
      </Container800>
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
        destination: '/',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI);
  await queryClient.prefetchQuery(['addrs'], () => loadAddrsAPI);
  await queryClient.prefetchQuery(['cartItems', id], () => loadCartAPI(id));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ViewCartItems;
