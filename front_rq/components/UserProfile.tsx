import { Button, Card, Space } from "antd";
import { AxiosError } from "axios";
import router from "next/router";
import React, { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { loadMyInfoAPI, logOutAPI } from "../apis/user";
import User from "../interfaces/user";

// 로그인시 보여주는 유저 프로필 
const UserProfile = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const mutation = useMutation<void, AxiosError>(logOutAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: () => {
      queryClient.setQueryData("user", null);
      router.replace("/");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onLogout = useCallback(
    // 로그아웃 버튼 클릭
    () => {
      mutation.mutate();
    },
    [mutation]
  );

  return (
    <Card>
      <Card.Meta title={myUserInfo.company} />
      <p>{myUserInfo.name}님</p>
      {myUserInfo?.role === "NOVICE" ? (
        <span>승인대기중</span>
      ) : (
        <span>{myUserInfo.role}</span>
      )}
      <br />
      <Space>
        <Button onClick={() => router.replace(`/user/edit`)} loading={loading}>
          정보수정
        </Button>
        <Button
          onClick={() => router.replace(`/user/addr-list`)}
          loading={loading}
        >
          주소록
        </Button>
        <Button onClick={onLogout} loading={loading} type="dashed" danger>
          로그아웃
        </Button>
      </Space>
    </Card>
  );
};

export default UserProfile;
