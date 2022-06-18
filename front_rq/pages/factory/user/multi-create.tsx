import { SearchOutlined } from "@ant-design/icons";
import {
  Breadcrumb, Button, message,
  Radio, Select, Typography
} from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import {
  createUsersAPI, loadMyInfoAPI, loadProvidersAPI, loadUserAPI
} from "../../../apis/user";
import AppLayout from "../../../components/AppLayout";
import {
  ContainerBig,
  InputFormTable,
  OptionContainer,
  Red,
  SearchBlock
} from "../../../components/Styled";
import UserInfoBox from "../../../components/UserInfoBox";
import useInput from "../../../hooks/useInput";

// --(관리자)여러 회원 생성 페이지--
const CreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("CUSTOMER");
  const [selectedProvider, setSelectedProvider] = useState();
  const [selectedProviderKey, setSelectedProviderKey] = useState("");
  const [isAutoKey, setIsAutoKey] = useState(true);
  const [isAddrMode, setIsAddrMode] = useState(false);
  const [userInputs, setUserInputs] = useState([
    {
      key: "",
      company: "",
      name: "",
      phone: "",
      zip: "",
      address: "",
    },
  ]);
  const [isProviderList, setIsproviderList] = useState(false);
  const { data: providerList } = useQuery("userList", loadProvidersAPI);
  const [searchTxt, onChangeSearchTxt, setSearchTxt] = useInput("");
  const { Title } = Typography;

  // 입력필드 10개로
  const onSetFieldMax = () => {
    let inputs = [...userInputs];
    for (let i = userInputs.length; i < 10; i++) {
      const input = {
        key: "",
        company: "",
        name: "",
        phone: "",
        zip: "",
        address: "",
      };
      inputs.push(input);
    }
    setUserInputs(inputs);
  };

  // 입력필드 추가
  const onAddField = () => {
    if (userInputs.length > 9) {
      return message.error("최대 10개 필드까지 입력 가능합니다.");
    }
    setUserInputs([
      ...userInputs,
      { key: "", company: "", name: "", phone: "", zip: "", address: "" },
    ]);
  };
  const onRemoveField = () => {
    const list = [...userInputs];
    list.splice(userInputs.length - 1, 1);
    setUserInputs(list);
  };

  const onInitField = () => {
    setUserInputs([
      { key: "", company: "", name: "", phone: "", zip: "", address: "" },
    ]);
  };

  // 폼 배열 입력
  const handleInputChange = (e, index) => {
    const name = e.target.name;
    let value = e.target.value;
    if (name === "phone" || name === "zip") {
      value = e.target.value.replace(/[^0-9]/g, "");
    }
    if (name === "key") {
      value = e.target.value
        .replace(/[ㄱ-힣\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\")]/g, "")
        .trim()
        .toLowerCase();
    }
    const list = [...userInputs];
    list[index][name] = value;
    setUserInputs(list);
  };

  // 회원등급 변경
  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
    if (e.target.value === "PROVIDER" || "NOVICE") {
      setSelectedProviderKey("");
      setSelectedProvider(null);
      setSearchTxt("");
      setIsproviderList(false);
    }
  };

  // 아이디 자동생성 모드 변경
  const handleAutoKeyChange = (e) => {
    setIsAutoKey(e.target.value);
    if (e.target.value === true) {
      let list = [...userInputs];
      for (let i = 0; i < list.length; i++) {
        list[i].key = "";
      }
      setUserInputs(list);
    }
  };

  // 주소입력모드 변경
  const handleAddrModeChange = (e) => {
    setIsAddrMode(e.target.value);
    if (e.target.value === false) {
      let list = [...userInputs];
      for (let i = 0; i < list.length; i++) {
        list[i].zip = "";
        list[i].address = "";
      }
      setUserInputs(list);
    }
  };

  // 판매자 회원 찾기
  const onSearchClick = () => {
    setLoading(true);
    if (searchTxt === "") {
      setLoading(false);
      return message.error("값을 입력해주세요.");
    }
    loadUserAPI(searchTxt)
      .then((response) => {
        message.success("판매사 " + response.company + "선택완료");
        setSelectedProviderKey(response.key);
      })
      .catch((error) => {
        message.error(error.response.data);
        setSearchTxt("");
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 폼 전송
  const onReqCreatUsers = (e) => {
    e.preventDefault();
    let error = false;
    if (isAutoKey === false) {
      userInputs?.map((v) => {
        if (v.key.length < 4) {
          error = true;
        }
      });
    }
    if (error) {
      return message.error("아이디를 4자이상 입력해주세요.");
    }
    if (userRole === "CUSTOMER" && selectedProviderKey === "") {
      return message.error("판매자를 선택해주세요.");
    }
    setLoading(true);
    const datas = {
      role: userRole,
      ProviderKey: selectedProviderKey,
      isAutoKey,
      isAddrMode,
      userDatas: userInputs,
    };
    createUsersAPI(datas)
      .then((result) => {
        message.success("회원생성이 완료됐습니다.");
        onInitField();
      })
      .catch((error) => {
        message.error(
          "아이디 중복, 잘못된 입력 등의 이유로 회원생성에 실패했습니다."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AppLayout>
      <ContainerBig>
        <Head>
          <title>회원 생성</title>
        </Head>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/factory/">
              <a>관리자페이지</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>회원관리</Breadcrumb.Item>
          <Breadcrumb.Item>여러회원생성</Breadcrumb.Item>
        </Breadcrumb>
        <br />
        <Title level={3}>회원 생성</Title>
        <br />
        <Radio.Group onChange={handleAutoKeyChange} defaultValue={true}>
          <Radio.Button value={false}>아이디 수동입력</Radio.Button>
          <Radio.Button value={true}>아이디 자동생성</Radio.Button>
        </Radio.Group>
        <br />
        <br />
        <Radio.Group onChange={handleAddrModeChange} defaultValue={false}>
          <Radio.Button value={false}>주소 없음</Radio.Button>
          <Radio.Button value={true}>주소 입력</Radio.Button>
        </Radio.Group>
        <br />
        <br />
        <Radio.Group onChange={handleRoleChange} defaultValue="CUSTOMER">
          <Radio.Button value="PROVIDER">판매자</Radio.Button>
          <Radio.Button value="CUSTOMER">구매자</Radio.Button>
          <Radio.Button value="NOVICE">비회원</Radio.Button>
        </Radio.Group>
        <br />
        <br />
        <form onSubmit={onReqCreatUsers}>
          {userRole === "CUSTOMER" ? (
            <>
              <label style={{ margin: "0 0 7px 0", fontWeight: "bold" }}>
                <Red>*</Red> 판매자 선택
              </label>
              <SearchBlock>
                <div>
                  <input
                    value={searchTxt}
                    onChange={onChangeSearchTxt}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        onSearchClick();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="search"
                    onClick={onSearchClick}
                  >
                    <SearchOutlined />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsproviderList(!isProviderList);
                  }}
                >
                  목록보기
                </button>
              </SearchBlock>
              {isProviderList ? (
                <>
                  <OptionContainer>
                    {providerList?.map((v) => {
                      return (
                        <p
                          className="provider"
                          onClick={() => {
                            setSearchTxt(v.key);
                            setSelectedProviderKey(v.key);
                            setSelectedProvider(v);
                            message.success("판매사 " + v.company + "선택완료");
                          }}
                        >
                          {v.company}
                        </p>
                      );
                    })}
                  </OptionContainer>{" "}
                  <br />
                </>
              ) : null}
            </>
          ) : null}
          {selectedProvider ? (
            <>
              <UserInfoBox userInfo={selectedProvider} /> <br />
              <br />
            </>
          ) : null}
          <Title level={4}>정보 입력</Title>
          <InputFormTable>
            <tr>
              <th>아이디</th>
              <th>회사명</th>
              <th>이름</th>
              <th>전화번호</th>
              {isAddrMode ? (
                <>
                  <th>우편번호</th>
                  <th>주소</th>
                </>
              ) : null}
            </tr>
            {userInputs.map((x, i) => {
              if (isAddrMode) {
                return (
                  <tr key={i}>
                    <td>
                      <input
                        name="key"
                        value={x.key}
                        onChange={(e) => handleInputChange(e, i)}
                        disabled={isAutoKey}
                        placeholder="숫자, -, 영문(필요시)으로 4~25자 이내"
                        autoComplete="off"
                        maxLength={20}
                      />
                    </td>
                    <td>
                      <input
                        name="company"
                        value={x.company}
                        onChange={(e) => handleInputChange(e, i)}
                        autoComplete="off"
                        maxLength={20}
                      />
                    </td>
                    <td>
                      <input
                        name="name"
                        value={x.name}
                        onChange={(e) => handleInputChange(e, i)}
                        autoComplete="off"
                        maxLength={10}
                      />
                    </td>
                    <td>
                      <input
                        name="phone"
                        value={x.phone}
                        onChange={(e) => handleInputChange(e, i)}
                        placeholder=" - 없이 숫자만 입력"
                        maxLength={13}
                        autoComplete="off"
                        required
                      />
                    </td>
                    <td>
                      <input
                        name="zip"
                        value={x.zip}
                        onChange={(e) => handleInputChange(e, i)}
                        autoComplete="off"
                      />
                    </td>
                    <td>
                      <input
                        name="address"
                        value={x.address}
                        onChange={(e) => handleInputChange(e, i)}
                        autoComplete="off"
                      />
                    </td>
                  </tr>
                );
              }
              return (
                <tr>
                  <td>
                    <input
                      name="key"
                      value={x.key}
                      onChange={(e) => handleInputChange(e, i)}
                      disabled={isAutoKey}
                      placeholder="숫자, -, 영문(필요시)으로 4~25자 이내"
                      maxLength={20}
                      autoComplete="off"
                      required={!isAutoKey}
                    />
                  </td>
                  <td>
                    <input
                      name="company"
                      value={x.company}
                      onChange={(e) => handleInputChange(e, i)}
                      maxLength={20}
                      required
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      name="name"
                      value={x.name}
                      maxLength={12}
                      onChange={(e) => handleInputChange(e, i)}
                      required
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      name="phone"
                      value={x.phone}
                      onChange={(e) => handleInputChange(e, i)}
                      placeholder=" - 없이 숫자만 입력"
                      maxLength={13}
                      autoComplete="off"
                      required
                    />
                  </td>
                </tr>
              );
            })}
          </InputFormTable>
          <Button onClick={onAddField}>+ 입력 필드 추가</Button>
          <Button onClick={onRemoveField}>- 입력 필드 제거</Button>
          <Button onClick={onSetFieldMax}>10개 입력</Button>
          <Button onClick={onInitField}>초기화</Button>
          <br />
          <br />
          <Button htmlType="submit" loading={loading} type="primary">
            회원 생성
          </Button>
        </form>
      </ContainerBig>
    </AppLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : ""; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = "";
  const key = context.params?.key as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  if (!response) {
    // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  if (response.role !== "ADMINISTRATOR") {
    // 관리자권한
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default CreateUser;
