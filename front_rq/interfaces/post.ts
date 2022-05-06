import User from './user';

export default interface Post {
  id: number;
  title: string,
  content: string;
  scope: string;
  type: string;
  createdAt: Date;
  UserId: number;
  imgSrc: string | null;
  PostViewUsers: [];
  User: User;
}
