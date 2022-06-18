import { FileExcelOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  message,
  Popconfirm,
  Table,
  Typography,
} from "antd";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import styled from "styled-components";
import {
  createStockAPI,
  deleteStockAPI,
  getSotcksAPI,
} from "../apis/inventory";
import MyTable from "./MyTable";
import { Block, FormBox, HGap, Red } from "./Styled";

const Content = styled.div`
  background-color: white;
  padding: 14px;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  .title {
    font-size: 11pt;
  }
  .date {
    float: right;
    font-size: 10pt;
  }
  hr {
    width: 100%;
    border: 0;
    border: 1px solid #cccccc;
  }
  .desc {
    margin-top: 12px;
    white-space: pre-wrap; // \r\n 줄바꿈 처리
  }
  .foot {
    margin-top: 12px;
    font-style: italic;
    text-align: right;
  }
  .empty {
    span {
      font-size: 16pt;
      color: #898989;
    }
    margin: 0 auto;
    text-align: center;
  }
`;

// 재고 품목 리스트
const StockList = (props) => {
  const { user, selectStock } = props;
  const [mode, setMode] = useState("LIST");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState(null);
  const { Title } = Typography;
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const onSubmit = () => {
    setLoading(true);
    setIsUpdated(false);
    const datas = { type, name, desc, userId: user.id };
    createStockAPI(datas)
      .then((res) => {
        message.success("품목을 추가했습니다.");
      })
      .catch((error) => {
        message.error(error);
      })
      .finally(() => {
        setType("");
        setName("");
        setDesc("");
        setIsUpdated(true);
        setMode("LIST");
      });
    return;
  };

  const getStocks = (user) => {
    const userId = Number(user.id);
    setLoading(true);
    getSotcksAPI(userId)
      .then((data) => {
        setStocks(data);
      })
      .catch((e) => {
        message.error(JSON.stringify(e));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDeleteStock = (id) => () => {
    setLoading(true);
    setIsUpdated(false);
    const data = { id };
    deleteStockAPI(data)
      .then((data) => {
        message.info("해당 재고품을 삭제했습니다.");
      })
      .catch((e) => {
        message.error(JSON.stringify(e));
      })
      .finally(() => {
        setLoading(false);
        setIsUpdated(true);
      });
    return;
  };

  useEffect(() => {
    // 로그인시 데이터 가져오기.
    if (user) {
      getStocks(user);
    }
  }, [user, isUpdated]);

  const columns = [
    {
      title: "타입",
      dataIndex: "type",
      type: "id",
      key: "type",
    },
    {
      title: "id",
      dataIndex: "id",
      type: "sub",
      key: "id",
    },
    {
      title: "품명",
      dataIndex: "name",
      type: "title",
      key: "name",
    },
    {
      title: "",
      dataIndex: "name",
      type: "right",
      key: "action",
      render: (text, record) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            selectStock(record);
          }}
        >
          선택
        </Button>
      ),
    },
  ];

  const expandable = {
    expandedRowRender: (record) => (
      <div>
        {record.desc}
        <HGap />
        <Popconfirm
          placement="leftBottom"
          title="삭제하시겠습니까?"
          onConfirm={onDeleteStock(record.id)}
          okText="삭제"
          cancelText="취소"
        >
          <Button danger loading={loading}>
            제거
          </Button>
        </Popconfirm>
      </div>
    ),
  };

  if (loading || !user) {
    return (
      <>
        <Title level={5}>재고품목관리</Title>
        <Content>
          <div className="empty">
            <FileExcelOutlined />
            <br />
            데이터가 없거나 로드중입니다.
          </div>
        </Content>
      </>
    );
  }
  if (mode === "LIST")
    return (
      <>
        <Title level={5}>재고품목관리</Title>
        {!isMobile ? (
          <Table
            columns={columns}
            dataSource={stocks}
            rowKey="id"
            expandable={expandable}
          />
        ) : (
          <MyTable
            dataSource={stocks}
            columns={columns}
            rowKey="id"
            expandable={expandable}
          />
        )}
        <HGap />
        <Button
          onClick={() => {
            setMode("CREATE");
          }}
          type="primary"
        >
          + 새로운 품목 추가
        </Button>
        <br />
      </>
    );
  if (mode === "CREATE")
    return (
      <>
        <Head>
          <title>재고 품목 생성</title>
        </Head>
        <Divider>
          <Title level={4}>재고 품목 생성</Title>
        </Divider>
        <FormBox>
          <Form onFinish={onSubmit}>
            <Block>
              <label>
                <Red>* </Red>카테고리/타입
              </label>
              <input
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
                placeholder=""
                maxLength={12}
                required
              />
            </Block>
            <Block>
              <label>
                <Red>* </Red>제품 이름
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder=""
                maxLength={25}
                required
              />
            </Block>
            <Block>
              <label>제품 간단 설명</label>
              <input
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
                placeholder=""
                maxLength={100}
              />
            </Block>
            <Block>
              <Button type="primary" htmlType="submit" loading={loading}>
                생성
              </Button>
            </Block>
          </Form>
        </FormBox>
        <HGap />
        <Button
          onClick={() => {
            setMode("LIST");
          }}
        >
          목록으로 돌아가기
        </Button>
      </>
    );
};

export default StockList;
