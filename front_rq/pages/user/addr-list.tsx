// @ts-nocheck
// -> UseRef 문제 해결 못함
import { Button, Divider, message, Popconfirm, Typography } from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import React, { useEffect, useRef, useState } from "react";
import { dehydrate, QueryClient, useQuery, useQueryClient } from "react-query";
import { loadAddrsAPI, loadMyInfoAPI, removeAddrAPI } from "../../apis/user";
import AddressList from "../../components/AddressList";
import AppLayout from "../../components/AppLayout";
import { ContainerMid } from "../../components/Styled";
import User from "../../interfaces/user";

// --회원정보/주소록 페이지--
const AddrList = () => {
  const childRef = useRef();
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI, {
    // // 첫실행시 로드 안되는 문제로 주석처리
    // onSuccess: (data) => {
    //   console.log(data.id);
    //   loadAddrsAPI(data.id)
    //   .then((response) => {
    //     setAddrs(response);
    //   })
    //   .catch((error) => {
    //     alert(error.response.data);
    //   })
    // }
  });
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState();
  const [addrs, setAddrs] = useState([{}]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const { Title } = Typography;

  // 회원의 주소 데이터 가져오기
  const getAddrDatas = (user) => {
    loadAddrsAPI(user.id)
      .then((response) => {
        setAddrs(response);
      })
      .catch((error) => {
        message.error(error.response.data);
      });
  };
  useEffect(() => {
    // 로그인시 데이터 가져오기.
    if (myUserInfo.id) {
      getAddrDatas(myUserInfo);
    }
  }, [myUserInfo]);

  // 주소 삭제처리
  const onRemoveAddr = () => {
    setLoading(true);
    removeAddrAPI({ id })
      .then(() => {
        queryClient.invalidateQueries("user");
        message.success("주소를 삭제했습니다.");
        childRef.current.setInit();
        gerAddrDatas(myUserInfo);
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AppLayout>
      <ContainerMid>
        <Divider>
          <Title level={4}>내 주소 목록</Title>
        </Divider>
        <br />
        <AddressList
          ref={childRef}
          addrs={addrs}
          setId={setId}
          setName={setName}
          setPhone={setPhone}
          setAddress={setAddress}
          setZip={setZip}
          editable={false}
        />
        <br />
        {id ? (
          <Popconfirm
            title="주소를 삭제하시겠습니까?"
            onConfirm={onRemoveAddr}
            okText="삭제"
            cancelText="아니오"
          >
            <Button loading={loading} type="dashed" danger>
              주소 삭제
            </Button>
          </Popconfirm>
        ) : null}
      </ContainerMid>
    </AppLayout>
  );
};
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : ""; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = "";
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  if (!response) {
    // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default AddrList;
