export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  email: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar'>;
  content: string;
  createdAt: Date;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar'>;
  content: string;
  images?: string[];
  likes: Like[];
  comments: Comment[];
  createdAt: Date;
}
