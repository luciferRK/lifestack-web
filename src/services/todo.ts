import api from './api';

export interface Todo {
  public_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  workspace_id: number;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export type TodoUpdate = Partial<TodoCreate>;

export const todoService = {
  getTodos: async (completed?: boolean): Promise<Todo[]> => {
    const params = completed !== undefined ? { completed } : {};
    const response = await api.get('/todo/', { params });
    return response.data;
  },
  
  createTodo: async (todo: TodoCreate): Promise<Todo> => {
    const response = await api.post('/todo/', todo);
    return response.data;
  },
  
  updateTodo: async (publicId: string, todo: TodoUpdate): Promise<Todo> => {
    const response = await api.patch(`/todo/${publicId}`, todo);
    return response.data;
  },
  
  deleteTodo: async (publicId: string): Promise<void> => {
    await api.delete(`/todo/${publicId}`);
  }
};
