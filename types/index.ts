import { Types } from "mongoose";

export type ProjectStatus = "active" | "completed" | "on-hold";

export interface ProjectType {
  _id: string;
  name: string;
  clientName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  tags: string[];
  totalValue: number;
  paidAmount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeadlineType {
  _id: string;
  projectId: string;
  title: string;
  date: string;
  type: "milestone" | "payment" | "general";
  isCompleted: boolean;
  createdAt: string;
}

export interface PaymentType {
  _id: string;
  projectId: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
  createdAt: string;
}

export interface DocumentType {
  _id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  publicId: string;
  category: "contract" | "design" | "report" | "other";
  size?: number;
  fileType?: string;
  createdAt: string;
}

export interface CredentialType {
  _id: string;
  projectId: string;
  serviceName: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  createdAt: string;
}

export interface ReminderType {
  _id: string;
  projectId: string;
  title: string;
  date: string;
  type: "payment" | "deadline";
  isSent: boolean;
  createdAt: string;
}

export interface ActivityLogType {
  _id: string;
  projectId: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingDeadlines: DeadlineType[];
  recentActivities: ActivityLogType[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
