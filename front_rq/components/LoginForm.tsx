import { Button, Form, Input } from "antd";
import { AxiosError } from "axios";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { logInAPI } from "../apis/user";
import useInput from "../hooks/useInput";
import User from "../interfaces/user";
import { Block, ContainerSmall, FormBox } from "./Styled";

// 로그인 폼
const LoginForm = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [key, onChangeKey] = useInput("");
  const [password, onChangePassword] = useInput("");
  const mutation = useMutation<
    User,
    AxiosError,
    { key: string; password: string }
  >("user", logInAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
      // message.error(error.response?.data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData("user", user);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmitForm = useCallback(() => {
    mutation.mutate({ key, password });
  }, [key, password, mutation]);

  return (
    <ContainerSmall>
      <FormBox>
        <Form onFinish={onSubmitForm} style={{ padding: "10px" }}>
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
          <Block>
            <Button type="primary" htmlType="submit" loading={loading}>
              로그인
            </Button>
            <Link href="/user/signup">
              <a>
                <Button>회원가입</Button>
              </a>
            </Link>
          </Block>
        </Form>
      </FormBox>
    </ContainerSmall>
  );
};

export default LoginForm;
