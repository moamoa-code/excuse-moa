import React, { FC, useCallback, useState } from 'react';
import { Empty, Space, Tag } from 'antd';
import styled from 'styled-components';
import { DownOutlined, IdcardOutlined, PhoneOutlined, RightOutlined, UpOutlined } from '@ant-design/icons';


const Div = styled.div`
  padding: 5px 0 10px 0;
  .top {
    padding: 0 5px 5px 5px;
    border-bottom: 1px solid #dadada;
    .titleBar {
      font-size: 12pt;
      display: flex;
      .title {
        flex: 1;
      }
      .button {
        margin-left: auto;
      }
    }
    .tags {
      padding: 5px 0 5px 0;
    }
  }
  .content {
    animation: fadeInDown 0.2s;
    margin-top: 10px;
    display: none;
    background-color: #f5fafe;
    padding: 10px;
    border-radius: 5px;
  }
  @keyframes fadeInDown {
    0% {
      opacity: 0;
      transform: translate3d(0, -20%, 0);
    }
    to {
      opacity: 1;
      transform: translateZ(0);
    }
  }
  .expand {
    display: block;
  }

`
type EBoxProps = {
  title: string;
  tags: Array<any> | null;
  children: React.ReactNode;
};

const ExpandableBox: FC<EBoxProps> = ({ title, tags, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (  
    <Div>
      <div className='top'>
        <div 
          className='titleBar' 
          onClick={()=>{
            setIsExpanded(!isExpanded)
          }}
        >
          <div className='title'>{title}</div>
          <div className='button'>
            {isExpanded?
            <UpOutlined />
            :<DownOutlined />}
            
          </div>
        </div>
        {tags?.length >= 1?
          <div className='tags'>
          {tags?.map((v, k) => {
            return (
              <Space wrap><Tag key={k}>{v}</Tag></Space>
            )
          })}
        </div>
        :null}
      </div>
      <div className={isExpanded?'content expand': 'content'}>
        {children}
      </div>
      
    </Div>
  );
};

export default ExpandableBox;
