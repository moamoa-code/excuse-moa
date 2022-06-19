import Item from "./item";
import Post from "./post";

export default interface User {
  id: number; // UUID
  key: string; // 로그인용 아이디
  hqNumber: string|null; // 본사 사업자번호
  company: string|null; // 회사명
  name: string|null; // 담당자 이름
  phone: string|null; // 담당자 전화번호
  email: string|null; // 담당자 이메일
  role: string; // 회원등급
  ProviderId: number; // (구매자) 지정 판매자
  Providers: User[] | null;
  Customers: User[] | null; // (판매자) 고객목록
  UserViewItems: Item[] | null; // 열람가능한 제품목록
  UserViewPosts: Post[] | null; // 열람가능한 공지목록
}