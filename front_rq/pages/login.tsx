import React from "react";
import { useQuery } from "react-query";

import UserProfile from "../components/UserProfile";
import LoginForm from "../components/LoginForm";
import AppLayout from "../components/AppLayout";

import { loadMyInfoAPI } from "../apis/user";
import User from "../interfaces/user";

// --로그인 페이지--
const Login = () => {
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);

  return (
    <AppLayout>
      <div style={{ margin: "0 auto" }}>
        {myUserInfo ? <UserProfile /> : <LoginForm />}
      </div>
    </AppLayout>
  );
};

export default Login;