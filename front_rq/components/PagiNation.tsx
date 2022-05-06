import React, { useState } from "react";
import styled from "styled-components";

const PageUl = styled.ul`
  margin-top: 10px;
  float: right;
  list-style: none;
  text-align: center;
`;

const PageLi = styled.li`
  display: inline-block;
  font-size: 13pt;
  padding: 5px;
`;

const PageSpan = styled.span`
padding: 5px;
  &:hover::after,
  &:focus::after {
    border-radius: 100%;
    color: white;
  }
  &:hover {
    cursor: pointer;
    color: white;
    background-color: #498bdc;
  }
  &:focus::after {
    color: white;
    background-color: #263a6c;
  }
`;

const SelectedPageSpan = styled.span`
  border: 1px solid #6bc8ff;
  padding: 5px;
`;

const PagiNation = ({ postsPerPage, totalPosts, paginate }) => {
  const [currentPageNumber, serCurrentPageNumber] = useState(1);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }
  return (
    <div>
      <nav>
        <PageUl>
          {pageNumbers.map((number) => (
            <PageLi key={number}>
              {currentPageNumber === number?
                <SelectedPageSpan>
                  {number}
                </SelectedPageSpan>
              :
                <PageSpan 
                  onClick={() => {
                    paginate(number);
                    serCurrentPageNumber(number);
                  }}
                >
                {number}
                </PageSpan>
              }
            </PageLi>
          ))}
        </PageUl>
      </nav>
    </div>
  );
};

export default PagiNation;