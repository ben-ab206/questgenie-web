export interface Subjects {
  id: number;
  created_at: string;
  user_id: number;
  type: string;
  topic: string;
  content: string;
  source?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  description?: string;
  title?: string;
}
