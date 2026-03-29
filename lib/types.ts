export interface CleaningSession {
  id: string;
  cleaner_name: string;
  cleaner_phone: string | null;
  session_date: string;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'reviewed' | 'rejected';
  reviewer_name: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export interface CleaningCheck {
  id: string;
  session_id: string;
  zone_id: string;
  zone_name: string;
  zone_category: 'interior' | 'exterior';
  task_index: number;
  task_text: string;
  is_checked: boolean;
  checked_at: string | null;
  created_at: string;
}

export interface CleaningMedia {
  id: string;
  session_id: string;
  zone_id: string;
  media_type: 'photo' | 'video';
  storage_path: string;
  public_url: string | null;
  file_name: string | null;
  file_size: number | null;
  uploaded_at: string;
}

export interface CleaningManual {
  id: string;
  zone_id: string;
  zone_name: string;
  video_url: string | null;
  description: string | null;
  updated_at: string;
}

export interface Cleaner {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  cleaner_name: string;
  cleaner_phone: string | null;
  session_date: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  reviewer_name: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  tasks_done: number;
  tasks_total: number;
  media_count: number;
  photo_count: number;
  video_count: number;
  zones_with_media: number;
}

export interface ZoneProgress {
  zoneId: string;
  totalTasks: number;
  checkedTasks: number;
  photoCount: number;
  videoCount: number;
  isComplete: boolean;
}
