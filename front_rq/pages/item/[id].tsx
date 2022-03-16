// 상품 보기
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState } from 'react';
import { Form, Input, Button, Tag, Checkbox, Divider, Space, notification } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../apis/user';
import { loadItemAPI, addCustomerToItemAPI } from '../../apis/item';
import useInput from '../../hooks/useInput';
import AppLayout from '../../components/AppLayout';
import ItemView from '../../components/ItemView'; // 제품 상세정보 보기 컴포넌트
import User from '../../interfaces/user';
import Item from '../../interfaces/item';

import ItemAddCustomer from '../../components/ItemAddCustomer';
import { CheckCircleOutlined } from '@ant-design/icons';

const ViewItem = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { id } = router.query; // 제품의 id
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: item } = useQuery<Item>(['item', id], () => loadItemAPI(Number(id)));
  const [loading, setLoading] = useState(false);

  const [customerId, onChangeCustomerId] = useInput(''); //

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  const onSubmit = (values) => {
    console.log(values);
    const itemId = Number(id);
    addCustomerToItemAPI({ itemId, values })
    .then(() => {
      openNotification('제품을 열람가능한 고객 추가를 완료했습니다.')
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  const printTags = (myCustomers, customer) => {
    if (myCustomers.include(customer)) {
      return <Tag color="blue"><Checkbox value={customer.id}>{customer.company} / {customer.name}</Checkbox> </Tag>
    }
    return <Tag><Checkbox value={customer.id}>{customer.company} / {customer.name}</Checkbox> </Tag>
  }

  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <ItemView item={item} myUserInfo={myUserInfo} />
        <Form 
          style={{ margin: '10px 0 20px' }}
          encType="multipart/form-data"
          onFinish={onSubmit}
          initialValues={{ // 제품 볼 수 있는 유저 체크
            'customerIds': item.ItemViewUsers.map((v) => (v.id)),
          }}
        >
        <Divider orientation="left">열람가능한 고객 추가</Divider>
          <Form.Item name="customerIds">
            <Checkbox.Group>
              <Space size={8} wrap>
                {myUserInfo.Customers.map((v) => (
                  <>
                    {/* {printTags(myUserInfo.Customers, v)} */}
                    <Tag color="blue"><Checkbox value={v.id} >{v.company} / {v.name}</Checkbox> </Tag>
                  </>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            적용 완료
          </Button>
        </Form>
      </div>
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
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['item', id], () => loadItemAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ViewItem;
