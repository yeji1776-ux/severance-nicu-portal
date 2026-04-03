import { Request } from 'express';

export interface DbUser {
  id: number;
  email: string | null;
  password_hash: string;
  name: string;
  phone: string | null;
  pin_hash: string | null;
  role: 'parent' | 'admin';
  created_at: string;
}

export interface DbPatient {
  id: number;
  chart_number: string;
  name: string;
  gestational_weeks: number;
  birth_weight: number;
  birth_date: string;
  admission_date: string;
  discharge_date: string | null;
  status: 'active' | 'discharged' | 'expired';
  created_at: string;
}

export interface DbInvitationCode {
  id: number;
  code: string;
  patient_id: number;
  created_by: number;
  expires_at: string;
  used_by: number | null;
  used_at: string | null;
  created_at: string;
}

export interface DbCareJourneyTemplate {
  id: number;
  step_order: number;
  label: string;
  sub_label: string;
  icon_name: string;
}

export interface DbPatientCareJourney {
  id: number;
  patient_id: number;
  template_id: number;
  status: 'pending' | 'active' | 'completed';
}

export interface DbContentCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface DbContentModule {
  id: number;
  category_id: number;
  title: string;
  subtitle: string;
  type: 'interactive' | 'video' | 'text';
  status: 'published' | 'review' | 'draft';
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDischargeCategory {
  id: number;
  title: string;
  subtitle: string;
  icon_name: string;
  is_emergency: boolean;
  sort_order: number;
}

export interface DbDischargeItem {
  id: number;
  category_id: number;
  content: string;
  sort_order: number;
}

export interface DbNotice {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at: string;
}

export interface DbExamination {
  id: number;
  name: string;
  description: string;
}

export interface DbPatientExamination {
  id: number;
  patient_id: number;
  examination_id: number;
  scheduled_date: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DbVitalSign {
  id: number;
  patient_id: number;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  temperature: number;
  recorded_at: string;
}

export interface DbNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  is_read: boolean;
  created_at: string;
}

export interface DbAiChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
}

export interface DbAiChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string | null;
    name: string;
    role: 'parent' | 'admin';
  };
}
