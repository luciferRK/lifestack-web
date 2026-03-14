import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2PasswordRequestForm expects username
    formData.append('password', password);
    
    // Uses form-urlencoded for login because FastAPI OAuth2PasswordRequestForm expects it
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (email: string, password: string, username: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/users/me'); // Assuming there is a me endpoint
      return response.data;
    } catch {
      return null;
    }
  },
  
  logout: async () => {
    // Call backend logout endpoint if it exists to clear cookies, 
    // or just rely on local state clearing for now
  }
};
