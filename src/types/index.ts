export type * from './auth';
export type * from './rsud';
export type * from './bapok';
export type * from './islamic';
export type * from './transjatim';

export interface BaseResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}
