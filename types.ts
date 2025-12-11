export enum UserRole {
  ADMIN = 'ADMIN',
  DEPARTMENT_LEAD = 'DEPARTMENT_LEAD',
  DEPARTMENT_USER = 'DEPARTMENT_USER',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  department?: Department; // Expanded from API
  avatarUrl: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // For select type
  required: boolean;
  unit?: string;
}

export interface ReportDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  structure: ReportField[];
  status: 'active' | 'draft' | 'inactive';
  departmentId?: string | null;
  departmentName?: string;
}

export interface ReportSubmission {
  id: string;
  reportDefinitionId: string;
  departmentId: string;
  departmentName: string;
  submittedBy: string;
  submittedAt?: string; // ISO Date
  periodStart: string;
  periodEnd: string;
  data: Record<string, any>;
  status: ReportStatus;
  version: number;
}
