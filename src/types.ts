export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'parent' | 'admin';
  patients: Patient[];
}

export interface Patient {
  id: number;
  chart_number: string;
  name: string;
  gestational_weeks: number;
  birth_weight: number;
  birth_date: string;
  admission_date: string;
  discharge_date: string | null;
}

export interface JourneyStep {
  template_id: number;
  step_order: number;
  label: string;
  sub_label: string;
  icon_name: string;
  status: 'pending' | 'active' | 'completed';
}

export interface ContentCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface ContentModule {
  id: number;
  title: string;
  subtitle: string;
  type: 'interactive' | 'video' | 'text';
  status: 'published' | 'review' | 'draft';
  category_name: string;
  category_slug: string;
  created_at: string;
  updated_at: string;
}

export interface CareStep {
  id: number;
  label: string;
  description: string;
  icon: string;
  active: boolean;
  completed: boolean;
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at: string;
}

export interface Examination {
  id: number;
  name: string;
  description: string;
  scheduled_date: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DischargeCategory {
  id: number;
  title: string;
  subtitle: string;
  icon_name: string;
  is_emergency: boolean;
  sort_order: number;
  items: string[];
}

export interface VitalSign {
  id: number;
  patient_id: number;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  temperature: number;
  recorded_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  is_read: boolean;
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
