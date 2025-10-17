export interface BlockedLogin {
  id: number;
  username: string;
  visitor_id: string | null;
  result: string | null;
  ip_address: string | null;
  user_agent: string | null;
  blocked_at: string;
}

export interface BlockedLoginsResponse {
  logs: BlockedLogin[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface BlockedLoginsFilters {
  username: string;
  result: string;
  ip: string;
  start_date: string;
  end_date: string;
}

export type DateFilterPreset = 'all' | 'last_24h' | 'last_7d' | 'last_30d';
