'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User, Post, Comment, Like } from '@/types';
import { authApi, usersApi, postsApi, commentsApi } from '@/lib/api';

interface SocialContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  userPosts: Post[];
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  loadPosts: () => Promise<void>;
  loadUserPosts: (userId: string) => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  updatePost: (postId: string, updates: { content?: string; images?: string[] }) => Promise<void>;
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
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario desde el token al iniciar
  const loadUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        console.log('[SocialContext] No hay token, no se carga usuario');
        setIsLoading(false);
        return;
      }

      console.log('[SocialContext] Verificando token...');
      const response = await authApi.verify();
      console.log('[SocialContext] Respuesta de verify:', response);
      
      if (response.valid && response.user) {
        console.log('[SocialContext] Usuario cargado desde verify:', response.user);
        setCurrentUser({
          id: String(response.user.id),
          email: response.user.email,
          username: response.user.username,
          name: response.user.name,
          bio: response.user.bio || '',
          avatar: response.user.avatar,
          coverImage: response.user.coverImage,
          createdAt: new Date(response.user.createdAt || response.user.created_at),
        });
      } else {
        console.log('[SocialContext] Token inválido o sin usuario, removiendo token');
        localStorage.removeItem('auth_token');
        setCurrentUser(null);
      }
    } catch (err: any) {
      console.error('[SocialContext] Error loading user:', err);
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper para mapear posts del backend
  const mapPost = useCallback(async (post: any): Promise<Post> => {
    const createdAt = post.created_at || post.createdAt;
    
    // Cargar comentarios y likes para cada post
    let comments: Comment[] = [];
    let likes: Like[] = [];
    
    try {
      [comments, likes] = await Promise.all([
        commentsApi.getByPost(post.id),
        commentsApi.getLikesByPost(post.id)
      ]);
    } catch (err) {
      console.error(`Error loading comments/likes for post ${post.id}:`, err);
      // Si falla, intentar cargar por separado
      try {
        comments = await commentsApi.getByPost(post.id);
      } catch (err2) {
        console.error(`Error loading comments for post ${post.id}:`, err2);
      }
      try {
        likes = await commentsApi.getLikesByPost(post.id);
      } catch (err3) {
        console.error(`Error loading likes for post ${post.id}:`, err3);
      }
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
      likes: likes, // Cargar likes desde el backend
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
  }, []);

  // Cargar posts desde la API
  const loadPosts = useCallback(async () => {
    try {
      setError(null);
      const response = await postsApi.getFeed(1, 50);
      
      // Mapear los posts a nuestro formato
      const mappedPosts: Post[] = await Promise.all(
        response.posts.map((post: any) => mapPost(post))
      );
      
      setPosts(mappedPosts);
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Error al cargar las publicaciones');
    }
  }, [mapPost]);

  // Cargar posts de un usuario específico
  const loadUserPosts = useCallback(async (userId: string) => {
    try {
      setError(null);
      const response = await postsApi.getByUser(userId, 1, 50);
      
      // Mapear los posts a nuestro formato
      const mappedPosts: Post[] = await Promise.all(
        response.posts.map((post: any) => mapPost(post))
      );
      
      setUserPosts(mappedPosts);
    } catch (err: any) {
      console.error('Error loading user posts:', err);
      setError(err.message || 'Error al cargar las publicaciones del usuario');
    }
  }, [mapPost]);

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

  const updatePost = useCallback(async (postId: string, updates: { content?: string; images?: string[] }) => {
    try {
      const response = await postsApi.update(postId, updates);
      
      // El backend devuelve el post actualizado, pero necesitamos recargar con likes y comentarios
      // Por ahora, actualizamos solo el contenido
      const updatePostInArray = (posts: Post[]) =>
        posts.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            content: response.content || post.content,
            images: Array.isArray(response.images) ? response.images : post.images,
          };
        });

      // Actualizar posts del feed
      setPosts((prev) => updatePostInArray(prev));
      
      // Actualizar posts del usuario
      setUserPosts((prev) => updatePostInArray(prev));
    } catch (err: any) {
      console.error('Error updating post:', err);
      throw err;
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await postsApi.delete(postId);
      
      // Eliminar de ambos arrays
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
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
      
      // Recargar los likes desde el servidor para asegurar consistencia
      const updatedLikes = await commentsApi.getLikesByPost(postId);
      
      // Función helper para actualizar likes en un array de posts
      const updateLikesInPosts = (posts: Post[]) =>
        posts.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            likes: updatedLikes,
          };
        });

      // Actualizar posts del feed
      setPosts((prev) => updateLikesInPosts(prev));
      
      // Actualizar posts del usuario si está en la página de perfil
      setUserPosts((prev) => updateLikesInPosts(prev));
      
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
        userPosts,
        isLoading,
        error,
        setCurrentUser,
        loadUser,
        loadPosts,
        loadUserPosts,
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
