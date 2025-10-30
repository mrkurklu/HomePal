export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'homeowner' | 'professional';
  phone?: string;
  address?: string;
  specialties?: string[];
  rating?: number;
  completedJobs?: number;
  createdAt?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  homeowner: User | string;
  professional?: User | string;
  scheduledDate?: string;
  completedDate?: string;
  price?: number;
  notes?: string;
  images?: string[];
  photoUrl?: string;
  minPrice?: number;
  maxPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  _id: string;
  job: Job | string;
  professional: User | string;
  homeowner: User | string;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export type ReminderCategory = 'cati' | 'tesisat' | 'elektrik' | 'bahce' | 'boya' | 'klima';

export interface Reminder {
  _id: string;
  homeowner: string;
  name: string;
  category: ReminderCategory;
  frequencyDays: number;
  nextDueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

