export type CustomProject = {
  id: string;
  project_ref: string;
  title: string;
  project_type: string;
  platform: string;
  status: string;
  budget_range: string | null;
  delivery_preference: string | null;
  created_at: string;
};