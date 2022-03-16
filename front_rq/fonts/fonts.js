import { createGlobalStyle } from "styled-components";
import NotoSansBold from "./NotoSansKR-Bold.woff";

export default createGlobalStyle `
  @font-face {
    font-family: 'Noto Sans Bold';
    src: local('Noto Sans Bold'),
    url(${ NotoSansBold } format('woff');
    font-weight: 300;
    font-style: normal;
`