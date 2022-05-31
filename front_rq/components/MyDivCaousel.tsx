import React, { useEffect, useRef, useState } from 'react';

import styled, { keyframes } from 'styled-components';

const MyCarousel = styled.div`
  width: 100%;
  @keyframes slidein {
    0% {
      opacity: 0;
      transform: translate3d(30%, 0, 0);
    }
    to {
      opacity: 1;
      transform: translateZ(0);
    }
  }

  .animate {
    background-color: pink;
    animation: slidein 0.4s;
  }

  .conainer {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    margin 0 auto;
  }
  .slideContainer {
    box-sizing: border-box;
    display: flex;
    .content {
      box-sizing: border-box;
      display: inline-block;
      width: 100%;
      flex-shrink: 0;
      img: {
        height: 200px;
      }
      h1 {

      }
    }
  }
`


const MyDivCarousel = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { contents } = props;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [classNames, setClassNames] = useState('');
  // const contents = [
  //   {
  //     img: './imgs/create_users.png',
  //     title: '고객생성',
  //     content: '하히하'
  //   }, {
  //     img: './imgs/user_list_info.png',
  //     title: '고객자',
  //     content: '하히하'
  //   }
  // ]  
  // useEffect(() => {
  //   if (ref.current) {
  //     // ref.current.classList.add('hide');
  //     ref.current.classList.add('animate');
  //     // ref.current.classList.remove('hide');
  //     // ref.current.style.transform = `translateX(200px)`;
  //     // ref.current.style.transition = 'all 2s ease-in-out';
  //     // ref.current.style.transform = `translateX(-200px)`;
  //   }
  // }, [currentSlide]);

  // useEffect(() => {
  //   if(ref.current) {
  //     console.log(currentSlide)
  //     console.log(ref.current.children[currentSlide]?.clientWidth);
  //     let nextSlide = 0;
  //     if (currentSlide >= contents.length) {
  //       nextSlide = 0;
  //     } else {
  //       nextSlide = currentSlide + 1;
  //     }
  //     let move = Number(ref.current.children[nextSlide]?.clientWidth);
  //     ref.current.style.transition = 'all 0.5s ease-in-out';
  //     ref.current.style.transform = `translateX(-${move}px)`; 
  //   }
  // }, [currentSlide])

  useEffect(() => {
    ref.current.style.transition = 'all 0.5s ease-in-out';
    ref.current.style.transform = `translateX(-${currentSlide}00%)`;
  }, [currentSlide]);

  // const onNextSlide = () => {
  //   if (currentSlide >= contents.length-1) {
  //     addAnimation();
  //     return setCurrentSlide(0);
  //   }
  //   addAnimation();
  //   setCurrentSlide(currentSlide+1)
  // }

  // const addAnimation = () => {
  //   setClassNames('animate');
  // }

  // const removeAnimation = () => {
  //   setClassNames('');
  // }

  // const onAnimationEnd = () => {
  //   removeAnimation();
  // }

  return (
    <MyCarousel>
      {/* <div 
        className={classNames}
        onAnimationEnd={onAnimationEnd}
      >
        <img src={contents[currentSlide].img} />
        <h1>{contents[currentSlide].title}</h1>
        <p>{contents[currentSlide].content}</p>
      </div> */}
      {/* <button onClick={onNextSlide}>▶</button> */}

      <div className='conainer'>
        <div className='slideContainer' ref={ref}>
          {contents?.map((v, i) => {
            return (
              <div className='content' key={i}>
                <img src={v.img} className='img'/>
                <h1>{v.title}</h1>
                <p>{v.content}</p>
              </div>
            )
          })}
        </div>
        <button onClick={()=>{
          if (currentSlide >= contents.length-1) {
            return setCurrentSlide(0);
          }
          setCurrentSlide(currentSlide + 1);
        }}>▶</button>
      </div>

    </MyCarousel>
  );
};

export default MyDivCarousel;
