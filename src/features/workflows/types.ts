export interface CategoryResponse {
  id: number;
  name: string;
  color: string;
  icon_name: string;
  order_index: number;
}

export interface WorkflowConfig {
  id: number;
  workflow_id: string;
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  order_index: number;
  category: CategoryResponse;
}
