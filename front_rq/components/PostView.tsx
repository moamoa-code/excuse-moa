import { FileExcelOutlined } from "@ant-design/icons";
import { Image, message } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { loadPostAPI } from "../apis/post";

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

// 공지사항 상세보기
const PostView = (props) => {
  const { post, postId } = props;
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      getPost(postId);
    } else {
      setPostData(post);
    }
  }, [post, postId]);

  const getPost = (id) => {
    setIsLoading(true);
    loadPostAPI(id)
      .then((data) => {
        setPostData(data);
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading || !postData) {
    return (
      <>
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
  return (
    <>
      <Content>
        <div className="title">
          {postData?.title}
          <span className="date">
            {dayjs(postData?.createdAt).format("YYYY.MM.DD HH:mm")}
          </span>
        </div>
        <hr />
        <div className="desc">
          {postData?.imgSrc ? (
            <div style={{ textAlign: "center" }}>
              <Image
                src={`${postData?.imgSrc}`}
                style={{ maxHeight: "300px" }}
              />
            </div>
          ) : null}
          {postData?.content}
        </div>
        <div className="foot">{postData?.User?.company}</div>
      </Content>
    </>
  );
};

export default PostView;
