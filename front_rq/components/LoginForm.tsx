import React, { useState, useCallback } from 'react';
import { Form, Input, Button, message } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

import useInput from '../hooks/useInput';

import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { logInAPI } from '../apis/user';

import User from '../interfaces/user';
import { ContainerSmall, Block, FormBox } from './Styled';


// 로그인 폼.

const ButtonWrapper = styled.div`
  margin-top:10px;
`;

// setIsLoggendIn -> components/AppLayout에서 옴
const LoginForm = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [key, onChangeKey] = useInput('');
  const [password, onChangePassword] = useInput('');
  const mutation = useMutation<User, AxiosError, { key: string; password: string }>('user', logInAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      message.error(error.response?.data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData('user', user);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmitForm = useCallback(() => {
    console.log(key, password);
    mutation.mutate({ key, password });
  }, [key, password, mutation]);


  return (
    <ContainerSmall>
      <FormBox>
        <Form onFinish={onSubmitForm} style={{ padding: '10px' }}>
          <Block>
            <label htmlFor="user-id">아이디</label>
            <input name="user-id" value={key} onChange={onChangeKey} required />
          </Block>
          <Block>
            <label htmlFor="user-password">비밀번호</label>
            <Input
              name="user-password"
              value={password}
              type="password"
              onChange={onChangePassword}
              required
            />
          </Block>
          <ButtonWrapper>
            <Button type="primary" htmlType="submit" loading={loading}>로그인</Button>
            <Link href="/user/signup"><a><Button>회원가입</Button></a></Link>
          </ButtonWrapper>
        </Form>
      </FormBox>
    </ContainerSmall>
  );
};

export default LoginForm;
