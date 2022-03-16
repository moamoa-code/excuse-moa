import React, { useCallback, useState } from 'react';
import { Avatar, Card, Button } from 'antd';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { loadMyInfoAPI, loadUserAPI, addCustomerAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';

const UserPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [loading, setLoading] = useState(false); 
  const { data: userInfo } = useQuery<User, AxiosError>(['user', id], () => loadUserAPI(String(id)));
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);

  const mutation = useMutation<void, AxiosError, { providerId: string; customerId: string }>(addCustomerAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: () => {
      // queryClient.setQueryData('user', null);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onAddCustomer = useCallback( // 고객등록
    () => {
      const providerId = myUserInfo.id;
      const customerId = userInfo.id;
      console.log(providerId, customerId);
      mutation.mutate({ providerId,  customerId });
    }, [mutation],
  );

  return (
    <AppLayout>
      {JSON.stringify(myUserInfo)}<br /><br />
      {JSON.stringify(userInfo)}
      {userInfo && (
        <Card
          style={{ marginBottom: 20 }}
      >
        <Card.Meta avatar={<Avatar>{userInfo.company[0]}</Avatar>} title={userInfo.company} />
        <p>{userInfo.name}님</p>
        <p>{userInfo.role}</p>
        {myUserInfo && <Button onClick={onAddCustomer} loading={loading}>내 고객으로 등록</Button>}
      </Card>
      )}
    </AppLayout>
  )

}

export default UserPage;
