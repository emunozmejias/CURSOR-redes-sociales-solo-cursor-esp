'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User, Post, Comment, Like } from '@/types';
import { authApi, usersApi, postsApi, commentsApi } from '@/lib/api';

interface SocialContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  loadPosts: () => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'user'>) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario desde el token al iniciar
  const loadUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.verify();
      if (response.valid && response.user) {
        setCurrentUser({
          ...response.user,
          createdAt: new Date(response.user.createdAt),
        });
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (err: any) {
      console.error('Error loading user:', err);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar posts desde la API
  const loadPosts = useCallback(async () => {
    try {
      setError(null);
      const response = await postsApi.getFeed(1, 50);
      
      // Mapear los posts a nuestro formato y cargar comentarios/likes
      const mappedPosts: Post[] = await Promise.all(
        response.posts.map(async (post: any) => {
          // Convertir fecha (el backend puede enviar created_at o createdAt)
          const createdAt = post.created_at || post.createdAt;
          
          // Cargar comentarios y likes para cada post
          let comments: Comment[] = [];
          let likes: Like[] = [];
          
          try {
            comments = await commentsApi.getByPost(post.id);
            // Los likes se manejan con el conteo, pero no hay endpoint para obtenerlos individualmente
            // así que usamos un array vacío y el conteo viene en post.likesCount
          } catch (err) {
            console.error(`Error loading comments for post ${post.id}:`, err);
          }
          
          return {
            id: String(post.id),
            userId: String(post.user_id || post.userId),
            user: post.user || {
              id: String(post.user_id || post.userId),
              name: post.user?.name || '',
              username: post.user?.username || '',
              avatar: post.user?.avatar,
            },
            content: post.content,
            images: Array.isArray(post.images) ? post.images : [],
            likes: likes, // Por ahora vacío, se actualiza cuando se da like
            comments: comments.map((c: any) => ({
              ...c,
              id: String(c.id),
              postId: String(c.post_id || c.postId),
              userId: String(c.user_id || c.userId),
              createdAt: new Date(c.created_at || c.createdAt),
              user: c.user || {},
            })),
            createdAt: new Date(createdAt),
          };
        })
      );
      
      setPosts(mappedPosts);
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Error al cargar las publicaciones');
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUser().then(() => {
      loadPosts();
    });
  }, [loadUser, loadPosts]);

  const addPost = useCallback(async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const response = await postsApi.create({
        content: postData.content,
        images: postData.images,
      });

      // El API puede devolver el post directamente o dentro de response.post
      const postResponse = (response as any).post || response;
      
      const mappedPost: Post = {
        id: String(postResponse.id),
        userId: String(postResponse.user_id || postResponse.userId),
        user: postResponse.user || postData.user,
        content: postResponse.content,
        images: Array.isArray(postResponse.images) ? postResponse.images : [],
        likes: [],
        comments: [],
        createdAt: new Date(postResponse.created_at || postResponse.createdAt),
      };

      setPosts((prev) => [mappedPost, ...prev]);
    } catch (err: any) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, [currentUser]);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await postsApi.delete(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err: any) {
      console.error('Error deleting post:', err);
      throw err;
    }
  }, []);

  const addComment = useCallback(async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'user'>) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const newComment = await commentsApi.create(postId, commentData.content);
      const mappedComment: Comment = {
        ...newComment,
        createdAt: new Date(newComment.created_at || newComment.createdAt),
      };

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, mappedComment] }
            : post
        )
      );
    } catch (err: any) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [currentUser]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const response = await commentsApi.toggleLike(postId);
      
      // Actualizar el estado local optimísticamente
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
    } catch (err: any) {
      console.error('Error toggling like:', err);
      throw err;
    }
  }, [currentUser]);

  const updateUserProfile = useCallback(async (userId: string, updates: Partial<User>) => {
    if (!currentUser || currentUser.id !== userId) {
      throw new Error('No puedes actualizar este perfil');
    }

    try {
      const updatedUser = await usersApi.updateMe(updates);
      
      setCurrentUser({
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
      });

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
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw err;
    }
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
        isLoading,
        error,
        setCurrentUser,
        loadUser,
        loadPosts,
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
