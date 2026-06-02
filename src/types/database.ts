// Hand-written Database type mirroring supabase/migrations/0001_schema.sql.
// Regenerate with `pnpm supabase gen types typescript --linked > src/types/database.gen.ts`
// once the Supabase CLI is wired up; for now this is authoritative.

export type ProfileSector =
  | "health"
  | "education"
  | "tech"
  | "nonprofit"
  | "retail"
  | "social_impact"
  | "finance"
  | "arts"
  | "other";

export type ProfileOrgType =
  | "for_profit"
  | "nonprofit"
  | "social_enterprise"
  | "cooperative"
  | "llc"
  | "other";

export type ProfileStage =
  | "solo"
  | "early_1_5"
  | "growth_6_20"
  | "established_20_plus";

export type ProfilePartnershipType =
  | "vendor"
  | "co_program"
  | "referral"
  | "sponsorship"
  | "advisory"
  | "other";

export type ProfileGeoReach = "local" | "regional" | "national" | "international";

export type ProfileStatus = "active" | "suspended" | "deleted";

export type MatchStatus = "pending" | "accepted" | "declined" | "expired";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type NotificationKind =
  | "match_request"
  | "match_accepted"
  | "match_declined"
  | "meeting_scheduled"
  | "flag_warning"
  | "flag_final_warning"
  | "calendar_disconnected";

// Columns that are SAFE to return to other users.
export type PublicProfileColumns = {
  id: string;
  alias: string;
  alias_color: string;
  alias_number: number;
  mission_statement: string;
  sector: ProfileSector;
  org_type: ProfileOrgType;
  stage: ProfileStage;
  partnership_types: ProfilePartnershipType[];
  what_we_offer: string;
  what_we_need: string;
  geographic_reach: ProfileGeoReach;
  region: string | null;
  impact_statement: string | null;
  created_at: string;
};

// Columns hidden until the meeting itself.
export type HiddenProfileColumns = {
  full_name: string;
  org_name: string;
  profile_photo_url: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  personal_email: string;
  years_in_operation: number | null;
  credentials: string | null;
};

export type SelfProfileColumns = PublicProfileColumns &
  HiddenProfileColumns & {
    flag_count: number;
    status: ProfileStatus;
    calendar_connected: boolean;
    onboarded_at: string | null;
    updated_at: string;
    timezone: string;
    notify_match_request: boolean;
    notify_match_accepted: boolean;
    notify_meeting_scheduled: boolean;
    notify_weekly_digest: boolean;
    is_admin: boolean;
    approval_status: ApprovalStatus;
    approved_at: string | null;
    approved_by: string | null;
  };

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type ProfileInsert = {
  id: string;
  alias: string;
  alias_color: string;
  alias_number: number;
  mission_statement: string;
  sector: ProfileSector;
  org_type: ProfileOrgType;
  stage: ProfileStage;
  partnership_types: ProfilePartnershipType[];
  what_we_offer: string;
  what_we_need: string;
  geographic_reach: ProfileGeoReach;
  full_name: string;
  org_name: string;
  personal_email: string;
  region?: string | null;
  impact_statement?: string | null;
  timezone?: string;
  profile_photo_url?: string | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
  years_in_operation?: number | null;
  credentials?: string | null;
  flag_count?: number;
  status?: ProfileStatus;
  calendar_connected?: boolean;
  onboarded_at?: string | null;
};

type ProfileUpdate = Partial<Omit<SelfProfileColumns, "id" | "created_at">>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: SelfProfileColumns;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          status: MatchStatus;
          score: number | null;
          rationale: string | null;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          requester_id: string;
          recipient_id: string;
          status?: MatchStatus;
          score?: number | null;
          rationale?: string | null;
          created_at?: string;
          responded_at?: string | null;
        };
        Update: Partial<{
          status: MatchStatus;
          responded_at: string | null;
          score: number | null;
          rationale: string | null;
        }>;
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          match_id: string;
          google_event_id_requester: string | null;
          google_event_id_recipient: string | null;
          meet_link: string | null;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          google_event_id_requester?: string | null;
          google_event_id_recipient?: string | null;
          meet_link?: string | null;
          starts_at: string;
          ends_at: string;
          created_at?: string;
        };
        Update: Partial<{
          google_event_id_requester: string | null;
          google_event_id_recipient: string | null;
          meet_link: string | null;
          starts_at: string;
          ends_at: string;
        }>;
        Relationships: [];
      };
      flags: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          reason: string | null;
        }>;
        Relationships: [];
      };
      google_oauth_tokens: {
        Row: {
          user_id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scope: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scope: string;
          updated_at?: string;
        };
        Update: Partial<{
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scope: string;
        }>;
        Relationships: [];
      };
      suggestions: {
        Row: {
          id: string;
          for_user: string;
          candidate: string;
          score: number;
          rationale: string;
          shown: boolean;
          dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          for_user: string;
          candidate: string;
          score: number;
          rationale: string;
          shown?: boolean;
          dismissed?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          shown: boolean;
          dismissed: boolean;
        }>;
        Relationships: [];
      };
      match_score_cache: {
        Row: {
          user_a: string;
          user_b: string;
          score: number;
          rationale: string;
          computed_at: string;
        };
        Insert: {
          user_a: string;
          user_b: string;
          score: number;
          rationale: string;
          computed_at?: string;
        };
        Update: Partial<{
          score: number;
          rationale: string;
          computed_at: string;
        }>;
        Relationships: [];
      };
      ai_call_log: {
        Row: {
          id: string;
          feature: string;
          user_id: string | null;
          model: string;
          input_tokens: number | null;
          output_tokens: number | null;
          cost_usd: number | null;
          latency_ms: number | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          feature: string;
          user_id?: string | null;
          model: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cost_usd?: number | null;
          latency_ms?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          error: string | null;
        }>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: NotificationKind;
          match_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: NotificationKind;
          match_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          read_at: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: {
      profiles_public: {
        Row: PublicProfileColumns;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profiles_self: {
        Row: SelfProfileColumns;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      profile_status: ProfileStatus;
      profile_sector: ProfileSector;
      profile_org_type: ProfileOrgType;
      profile_stage: ProfileStage;
      profile_partnership_type: ProfilePartnershipType;
      profile_geo_reach: ProfileGeoReach;
      match_status: MatchStatus;
      notification_kind: NotificationKind;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type { Json };
