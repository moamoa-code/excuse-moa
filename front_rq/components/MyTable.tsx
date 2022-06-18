import { DownOutlined, FileExcelOutlined, RightOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { HGap } from './Styled';

// 주로 모바일에서 보여지는 리스트
// antd의 Table과 컬럼 호환
const MyTable = (props) => {
  const {dataSource, columns, expandable, rowKey, selectKey, selectedId, pagination} = props;
  const [showKey, setShowKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const arrowStyle = useMemo(() => ({color: '#999999', fontSize: '9pt'}), []);
  const selectedStyle = useMemo(() => ({ backgroundColor: "#f8edf8" }), []);

  // styledComponets SSR 안되는 문제 땜빵
  const MyTaBle = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px 0px;
    .tag{
      background-color: #f0f0f0;
      box-sizing: border-box;
      border-radius: 4px;
      padding: 1px 4px 1px 4px;
      font-size: 8pt;
    }
    .expandable{
      animation-duration: 3s;
      animation-name: slidein;
      margin: 10px 0px 10px 0;
      animation: fadein 0.2s;
      @keyframes fadein {
        from {
          transform: translate3d(0, -10%, 0);
          opacity: 0;
        }
        to {
          transform: translateZ(0);
          opacity: 1;
        }
      }
    }
    .container {
      padding: 14px;
      border: 1px solid #e4e4e4;
      border-radius: 12px;
      box-shadow: 0px 9px 10px -4px rgba(0,0,0,0.07);
    }
    span {
    }
    .id {
      background-color: #4aa9ff;
      box-sizing: border-box;
      border: 1px solid;
      border-radius: 4px;
      padding: 1px 4px 1px 4px;
      color: white;
      font-size: 8pt;
    }
    .top {
      justify-content: flex-start;
      padding: 4px 0 4px 0;
      display: flex;
      align-items: center;
      flex-direction: row;
      font-size: 11pt;
      gap: 0px 6px;
      flex-wrap: wrap;
    }
    .expandableTop {
      justify-content: flex-start;
      padding: 4px 0 4px 0;
      display: flex;
      align-items: center;
      flex-direction: row;
      font-size: 11pt;
      gap: 0px 6px;
      flex-wrap: wrap;
    }
    .expandableTop:hover {
      font-weight: bold;
    }
    .bottom {
      padding: 4px 0 4px 0;
      display: flex;
      flex-direction: row;
      gap: 0px 6px;
      flex-wrap: wrap;
    }
    .inputs {
      padding: 4px 0 4px 0;
      display: flex;
      flex-direction: row;
      flex;justify-content: flex-end;
      gap: 0px 6px;
      flex-wrap: wrap;
    }
    .inputName{
      background-color: #a8d5ff;
      box-sizing: border-box;
      border-radius: 4px;
      padding: 1px 4px 1px 4px;
      font-size: 9pt;
    }
    .title{
      font-weight: 500;
    }
    .sub{
    }
    .right{
      margin-left: auto;
      p {
        display: inline;
        padding: 0;
        margin: 0;
        margin-left: 8px;
      }
    }
    .sub::before {
      content:" | "
    }
    .link {
      color: #1890ff;
    }
    .empty {
      span {
        font-size: 16pt;
        color: #898989;
      }
      margin: 0 auto;
      text-align: center;
    }
  `

  useEffect(() => { // 데이터 바뀔 경우 페이지 1로 이동
    onChangePage(1);
  }, [dataSource]);

  const currentPosts = (datas) => {
    let currentPosts = [];
    currentPosts = datas.slice(indexOfFirst, indexOfLast);
    return currentPosts;
  }
  const onExpandClick = (key) => () =>{
    if (key === showKey) {
      return setShowKey(null);
    }
    setShowKey(key);
  }
  const onChangePage = (page) => {
    setCurrentPage(page);
  }

  if (!dataSource || dataSource.length < 1 ) {
    return (
      <MyTaBle>
        <div className='container'>
            <div className='empty'>
              <FileExcelOutlined /><br />
              데이터가 없거나 로드중입니다.
            </div>
        </div>
      </MyTaBle>
    );
  }
  return (
    <div>
      <MyTaBle>
        {currentPosts(dataSource)?.map((data, i) => {
          return (
            <div className='container' key={i}>
              <div 
                className={expandable? 'expandableTop' : 'top'}
                onClick={
                  expandable?
                    onExpandClick(data[rowKey])
                :null}
                style={Number(selectedId) === data[selectKey]? selectedStyle
                : null}
              >
                {expandable && showKey !== null? 
                <DownOutlined style={arrowStyle}/>
                : expandable? <RightOutlined style={arrowStyle}/>
                : null}
                {columns?.map((coulumn, j) => {
                  if (coulumn.type === 'title'){
                    if (coulumn.render) {
                      return (
                      <span
                        key={j}
                        className='title'
                        >
                        {coulumn.render(data[coulumn?.key], data)}
                      </span>
                      );
                    } 
                    else {
                      return (
                        <span
                          key={j}
                          className='title'
                          >
                          {data[coulumn?.key]}
                        </span>
                        );
                    }
                  } else if (coulumn.type === 'id'){
                    if (coulumn.render) {
                      return (
                      <span
                        key={j}
                        className='id'
                        >
                        {coulumn.render(data[coulumn?.key], data)}
                      </span>
                      );
                    } 
                    else {
                      return <span
                        key={j}className='id'>{data[coulumn?.key]}</span>
                    }
                    
                  } else if (coulumn.type === 'sub'){
                    if (coulumn.render) {
                      return (
                      <span
                        key={j}
                        className='sub'
                        >
                        {coulumn.render(data[coulumn?.key], data)}
                      </span>
                      );
                    } 
                    else {
                      return (
                        <span
                          key={j}
                          className='sub'
                          >
                          {data[coulumn?.key]}
                        </span>
                        );
                    }
                  }
                })}
                <span 
                  className='right'
                >
                  {columns?.map((coulumn, j) => {
                    if (coulumn.type === 'right'){
                      if (coulumn.render) {
                        return (
                        <p key={j}>
                          {coulumn.render(data[coulumn?.key], data)}
                        </p>
                        );
                      } 
                      else {
                        return (
                          <p key={j}>
                            {data[coulumn?.key]}
                          </p>
                          );
                      }
                    };
                  })}
                </span>
              </div>
              {showKey !== data[rowKey]?
                <div className='bottom'>
                {columns?.map((coulumn, k) => {
                  if (coulumn.type !== 'title' && coulumn.type !== 'id' && coulumn.type !== 'right' && coulumn.type !== 'sub' && coulumn.type !== 'input'){
                    if (coulumn.render) {
                      return <span key={k}><span className='tag'>{coulumn?.title}</span> {coulumn.render(data[coulumn?.key], data)}</span>;
                    }
                    else {
                      return <span key={k}><span className='tag'>{coulumn?.title}</span> {data[coulumn?.key]}</span>
                    }
                  }
                })}
              </div>
              :null}
              {expandable && showKey !== null?
                <>
                  {showKey === data[rowKey]?
                    <div className='expandable'>
                      {expandable.expandedRowRender(data)}
                    </div>
                  :null
                  }
                </>
              :null}
              {columns.find((e) => {if (e.type === 'input') {return true}})?
                <div className='inputs'>
                {columns?.map((coulumn, l) => {
                  if (coulumn.type === 'input'){
                    if (coulumn.render) {
                      return (
                        <span key={l}>
                          {coulumn?.title.length >= 1?
                            <span className='inputName'>{coulumn?.title} </span>
                          :null }
                          {coulumn.render(data[coulumn?.key], data)}
                        </span>
                      );
                    }
                    else {
                      return (
                        <span key={l}>
                          {coulumn?.title.length >= 1?
                            <span className='inputName'>{coulumn?.title} </span>
                          :null }
                          {data[coulumn?.key]}
                        </span>
                      );
                    }
                  }
                })}
              </div>
              :null}
            </div>
          )
        })}
      </MyTaBle>
      {dataSource?.length > postsPerPage?
        <>
          <HGap />
          <Pagination current={currentPage} hideOnSinglePage={true} total={dataSource.length} onChange={onChangePage} style={{float: 'right'}} />
          <HGap />
        </>
      :
      <HGap />}
      {pagination?
        <Pagination total={pagination?.total} onChange={pagination?.onChange}></Pagination>
      :<HGap />}

    </div>
  )
}

export default MyTable;
