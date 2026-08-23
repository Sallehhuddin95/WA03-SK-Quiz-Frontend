export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiError {
  mesej: string;
  kod: string;
  butiran?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}
