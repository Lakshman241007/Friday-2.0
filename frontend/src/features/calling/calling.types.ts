export type CallStatus =
  | 'ready'
  | 'dialing'
  | 'ringing'
  | 'connected'
  | 'on_hold'
  | 'completed'
  | 'failed';

export type CallDirection = 'outbound' | 'inbound';

export type CallOutcome =
  | 'connected'
  | 'no_answer'
  | 'busy'
  | 'interested'
  | 'not_interested'
  | 'follow_up_required'
  | 'converted';

export interface Call {
  id: string;
  leadId?: string;
  leadName?: string;
  company?: string;
  phoneNumber: string;
  employeeId: string;
  employeeName: string;
  direction: CallDirection;
  status: CallStatus;
  outcome?: CallOutcome;
  startTime?: string;
  endTime?: string;
  durationSeconds: number;
  notes?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
}

export interface CallHistoryItem {
  id: string;
  date: string;
  leadId: string;
  leadName: string;
  company: string;
  employeeName: string;
  phoneNumber: string;
  duration: string;
  durationSeconds: number;
  status: CallStatus;
  outcome: CallOutcome;
  notes?: string;
}
