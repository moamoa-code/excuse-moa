import User from './user';

export default interface Post {
  id: number;
  title: string,
  content: string;
  createdAt: Date;
  imgSrc: string | null;
  PostViewUsers: [];
  User: User;
}
