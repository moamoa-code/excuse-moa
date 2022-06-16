import { AppProps, NextWebVitalsMetric } from 'next/app';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import 'antd/dist/antd.css';
import { QueryClient, QueryClientProvider, Hydrate } from 'react-query';
// import { ReactQueryDevtools } from 'react-query/devtools';

import styled from 'styled-components'
import GlobalFonts from '../fonts/fonts' // 1

const ExcuseMoa = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <meta charSet="utf-8" />
          <title>Moa-Order</title>
        </Head>
        
        <Component {...pageProps} />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </Hydrate>
    </QueryClientProvider>
  );
};

ExcuseMoa.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
}

export default ExcuseMoa;