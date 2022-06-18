import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Table } from "antd";
import dayjs from "dayjs";
import React from "react";
import PostView from "./PostView";

// 공지사항 목록
const PostList = ({ posts }) => {
  const columns = [
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      render: (text, record) => <>{text}</>,
    },
    {
      title: "작성자",
      dataIndex: "User",
      key: "User",
      render: (text, record) => <>{text?.company}</>,
    },
    {
      title: "작성일",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (text, record) => (
        <>
          {dayjs(text).format("YYYY.MM.DD HH:mm")}
          {}
        </>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        pagination={{ hideOnSinglePage: true }}
        expandable={{
          expandedRowRender: (record) => <PostView post={record} />,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <DownOutlined
                style={{ color: "#64707a", fontSize: "8pt" }}
                onClick={(e) => onExpand(record, e)}
              />
            ) : (
              <RightOutlined
                style={{ color: "#64707a", fontSize: "8pt" }}
                onClick={(e) => onExpand(record, e)}
              />
            ),
          expandRowByClick: true,
        }}
        dataSource={posts}
      />
    </>
  );
};

export default PostList;
