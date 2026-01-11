import { getApiUrl } from './config';
import type { User, Post, Comment } from '@/types';

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

interface PostResponse {
  post: Post;
}

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
}

// Helper para obtener el token del localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Helper para hacer peticiones HTTP
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
  });

  // Si la respuesta no es exitosa, intentar parsear el error
  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  // Intentar parsear JSON, si falla retornar texto vacío
  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}

// ============ AUTH API ============

export const authApi = {
  // Registro de usuario
  async register(data: {
    email: string;
    username: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Verificar token
  async verify(): Promise<{ valid: boolean; user?: User }> {
    return apiRequest('/api/auth/verify');
  },
};

// ============ USERS API ============

export const usersApi = {
  // Obtener perfil del usuario actual
  async getMe(): Promise<User> {
    const response = await apiRequest<{ user: User }>('/api/users/me');
    return response.user;
  },

  // Actualizar perfil
  async updateMe(updates: Partial<User>): Promise<User> {
    const response = await apiRequest<{ user: User }>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  },
};

// ============ POSTS API ============

export const postsApi = {
  // Obtener feed de publicaciones
  async getFeed(page = 1, limit = 10): Promise<PostsResponse> {
    return apiRequest<PostsResponse>(`/api/posts?page=${page}&limit=${limit}`);
  },

  // Crear publicación
  async create(data: { content: string; images?: string[] }): Promise<Post> {
    const response = await apiRequest<PostResponse>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.post;
  },

  // Obtener publicación por ID
  async getById(postId: string): Promise<Post> {
    const response = await apiRequest<PostResponse>(`/api/posts/${postId}`);
    return response.post;
  },

  // Eliminar publicación
  async delete(postId: string): Promise<void> {
    await apiRequest(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  },
};

// ============ COMMENTS API ============

export const commentsApi = {
  // Obtener comentarios de un post
  async getByPost(postId: string, page = 1, limit = 50): Promise<Comment[]> {
    const response = await apiRequest<CommentsResponse>(
      `/api/comments/post/${postId}?page=${page}&limit=${limit}`
    );
    return response.comments || [];
  },

  // Crear comentario
  async create(postId: string, content: string): Promise<Comment> {
    return apiRequest<Comment>(`/api/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Dar like a un post
  async toggleLike(postId: string): Promise<{ liked: boolean; likes: number }> {
    return apiRequest(`/api/comments/post/${postId}/like`, {
      method: 'POST',
    });
  },
};
