
import { db, TABLES } from './db';
import { User } from '../types';

const SESSION_KEY = 'app_session_user_id';

export const auth = {
  // Kiểm tra email/password và lưu session
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch('http://localhost:3003/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const user = await response.json();
      localStorage.setItem(SESSION_KEY, user.id);
      return user;
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    // Reload để reset toàn bộ state của React app
    window.location.reload();
  },

  getSessionUserId: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(SESSION_KEY);
  }
};
