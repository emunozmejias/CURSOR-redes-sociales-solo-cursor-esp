'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, Post, Comment, Like } from '@/types';

interface SocialContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  setCurrentUser: (user: User | null) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'user'>) => void;
  toggleLike: (postId: string) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  // Usuario actual por defecto para demo
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    name: 'Usuario Demo',
    username: 'usuario_demo',
    bio: 'Esta es mi biografía',
    email: 'demo@example.com',
    createdAt: new Date(),
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Usuario Demo',
      username: 'usuario_demo',
      bio: 'Esta es mi biografía',
      email: 'demo@example.com',
      createdAt: new Date(),
    },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: '1',
      user: {
        id: '1',
        name: 'Usuario Demo',
        username: 'usuario_demo',
        avatar: undefined,
      },
      content: '¡Bienvenido a la red social! Esta es mi primera publicación.',
      images: [],
      likes: [],
      comments: [],
      createdAt: new Date(Date.now() - 86400000), // Hace 1 día
    },
  ]);

  const addPost = useCallback((postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    if (!currentUser) return;

    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date(),
      likes: [],
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
  }, [currentUser]);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  }, []);

  const deletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  const addComment = useCallback((postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'user'>) => {
    if (!currentUser) return;

    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      createdAt: new Date(),
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  }, [currentUser]);

  const toggleLike = useCallback((postId: string) => {
    if (!currentUser) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const existingLike = post.likes.find((like) => like.userId === currentUser.id);

        if (existingLike) {
          // Quitar like
          return {
            ...post,
            likes: post.likes.filter((like) => like.id !== existingLike.id),
          };
        } else {
          // Agregar like
          const newLike: Like = {
            id: Date.now().toString(),
            postId,
            userId: currentUser.id,
            createdAt: new Date(),
          };
          return {
            ...post,
            likes: [...post.likes, newLike],
          };
        }
      })
    );
  }, [currentUser]);

  const updateUserProfile = useCallback((userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, ...updates } : user))
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }

    // Actualizar posts del usuario
    setPosts((prev) =>
      prev.map((post) =>
        post.userId === userId
          ? {
              ...post,
              user: {
                ...post.user,
                ...updates,
              },
            }
          : post
      )
    );
  }, [currentUser]);

  const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers((prev) => [...prev, newUser]);
  }, []);

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users,
        posts,
        setCurrentUser,
        addPost,
        updatePost,
        deletePost,
        addComment,
        toggleLike,
        updateUserProfile,
        addUser,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
