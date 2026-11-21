import { AiDrapePose, ProductImageRole } from './catalog';

export interface GeneratedLook {
  poseId: AiDrapePose;
  title: string;
  description: string;
  role: ProductImageRole;
  imageDataUrl: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface MultiPoseDrapeResponse {
  success: boolean;
  modelUsed: string;
  looks: GeneratedLook[];
  message?: string;
}
