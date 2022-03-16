import React from 'react';
import { Table } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import PostView from './PostView';
import dayjs from 'dayjs';


const PostList = ({ posts }) => {

  const columns = [
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <>{text}</>
      ),
    },{
      title: '작성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (text, record) => (
        <>{dayjs(text).format('YYYY.MM.DD HH:mm')}{}</>
      ),
    },
  ]

  return (
    <>
      <Table 
        size="small"
        rowKey="id"
        columns={columns}
        expandable={{
          expandedRowRender: (record) => 
          <PostView post={record}/>,
          expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <DownOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
          ) : (
            <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
          ),
          expandRowByClick: true
        }}
        dataSource={posts}
      />
    </>
  )
}

export default PostList;
