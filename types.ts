
export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Urgent' | 'Shopping' | 'Health';

export type AnimationType = 'flow' | 'pop' | 'slide' | 'blur';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  dueTime?: string; // HH:mm format
  notificationSent?: boolean;       // For 5-min warning
  overdueNotificationSent?: boolean; // For "Time Expired" alert
  createdAt: number;
  userId?: string; // Owner ID
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  createdAt: number;
}

export interface AppState {
  tasks: Task[];
  searchQuery: string;
  filterCategory: Category | 'All';
  showOnboarding: boolean;
}