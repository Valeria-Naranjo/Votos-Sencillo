export interface VotingEvent {
   id: number;
   name: string;
   logo_path: string | null;
   event_type: "attendance" | "attendance_ballot";
   max_votes: number;
   starts_at: string | null;
   ends_at: string | null;
   active: boolean;
   created_at?: string;
}
