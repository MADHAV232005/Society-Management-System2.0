export type UserRole = 'SUPER_ADMIN' | 'COMMITTEE' | 'RESIDENT' | 'SECURITY';

export interface ResidentProfile {
  id: number;
  flat_id: number;
  flat_number: string;
  wing_name: string;
  is_primary: boolean;
  move_in_date?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  resident_profile?: ResidentProfile | null;
}

export interface Society {
  id: number;
  name: string;
  registration_number: string;
  address: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Wing {
  id: number;
  society: number;
  society_id?: number;
  society_name?: string;
  name: string;
  total_floors?: number;
  created_at: string;
}

export interface Flat {
  id: number;
  wing: number;
  wing_id?: number;
  wing_name?: string;
  society_name?: string;
  flat_number: string;
  floor: number;
  area_sqft: string | number;
  is_occupied: boolean;
  is_active: boolean;
  resident_name?: string;
  resident_phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Resident {
  id: number;
  user: number;
  user_id?: number;
  username?: string;
  user_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  flat: number;
  flat_id?: number;
  flat_number?: string;
  wing_name?: string;
  floor?: number;
  is_primary: boolean;
  is_active: boolean;
  move_in_date: string;
  move_out_date?: string;
  created_at?: string;
}

export type BillStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface MaintenanceBill {
  id: number;
  flat: number;
  flat_id?: number;
  flat_number?: string;
  wing_name?: string;
  billing_month: string;
  due_date: string;
  amount: number;
  total_paid: number;
  pending_amount: number;
  status: BillStatus;
  description: string;
  created_at: string;
  updated_at?: string;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'NET_BANKING' | 'CARD' | 'CHEQUE';

export interface Payment {
  id: number;
  bill: number;
  bill_id?: number;
  flat_number?: string;
  wing_name?: string;
  billing_month?: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_reference: string;
  transaction_id?: string;
  notes?: string;
  status?: string;
  paid_by?: string;
  created_at: string;
}

export interface Receipt {
  id: number;
  payment: number;
  payment_id?: number;
  receipt_number: string;
  amount?: number;
  payment_method?: string;
  transaction_reference?: string;
  flat_number?: string;
  wing_name?: string;
  issued_at: string;
  generated_at?: string;
  download_url?: string;
}

export type ComplaintCategory =
  | 'MAINTENANCE'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'CLEANING'
  | 'SECURITY'
  | 'LIFT'
  | 'PARKING'
  | 'NOISE'
  | 'WATER'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export interface Complaint {
  id: number;
  resident: number;
  resident_name?: string;
  created_by?: string;
  flat: number;
  flat_id?: number;
  flat_number?: string;
  wing_name?: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to?: any;
  assigned_to_name?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ComplaintStatusHistory {
  id: number;
  complaint: number;
  old_status: string;
  new_status: string;
  changed_by: number;
  changed_by_name?: string;
  changed_at: string;
  remarks?: string;
}

export type VisitorType = 'GUEST' | 'DELIVERY' | 'SERVICE' | 'CAB' | 'OTHER';
export type VisitorStatus = 'EXPECTED' | 'CHECKED_IN' | 'INSIDE' | 'CHECKED_OUT' | 'CANCELLED';

export interface Visitor {
  id: number;
  visitor_name: string;
  name?: string;
  phone: string;
  flat: number;
  flat_id?: number;
  flat_number?: string;
  wing_name?: string;
  visit_type: VisitorType;
  visitor_type?: VisitorType;
  purpose: string;
  vehicle_number?: string;
  status: VisitorStatus;
  checked_in_at?: string | null;
  entry_time?: string | null;
  checked_out_at?: string | null;
  exit_time?: string | null;
  registered_by?: number;
  registered_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export type NoticeType = 'GENERAL' | 'MAINTENANCE' | 'EMERGENCY' | 'EVENT';
export type NoticePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'NORMAL';

export interface Notice {
  id: number;
  title: string;
  content: string;
  notice_type: NoticeType;
  priority: NoticePriority;
  is_pinned?: boolean;
  published_by?: number;
  published_by_name?: string;
  author?: string;
  published_at?: string;
  expiry_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type StaffType = 'SECURITY' | 'CLEANING' | 'MAINTENANCE' | 'GARDENER' | 'OTHER';
export type StaffRole = 'SECURITY_GUARD' | 'CLEANER' | 'ELECTRICIAN' | 'PLUMBER' | 'MANAGER' | 'GARDENER';
export type StaffShift = 'MORNING' | 'EVENING' | 'NIGHT' | 'GENERAL';

export interface Staff {
  id: number;
  name: string;
  phone: string;
  staff_type: StaffType;
  role?: StaffRole;
  shift?: StaffShift;
  address: string;
  assigned_wing?: string;
  joining_date: string;
  joined_date?: string;
  salary: number | string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ExpenseCategory =
  | 'MAINTENANCE'
  | 'ELECTRICITY'
  | 'WATER'
  | 'SECURITY'
  | 'CLEANING'
  | 'REPAIR'
  | 'SALARY'
  | 'UTILITY'
  | 'EVENT'
  | 'GARDENING'
  | 'OTHER';

export interface Expense {
  id: number;
  title: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  date?: string;
  vendor_name: string;
  paid_to?: string;
  invoice_number: string;
  receipt_no?: string;
  recorded_by?: number;
  recorded_by_name?: string;
  approved_by?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DocumentCategory =
  | 'BYLAWS'
  | 'AUDIT_REPORT'
  | 'MEETING_MINUTES'
  | 'VENDOR_CONTRACT'
  | 'POLICY'
  | 'OTHER';

export interface Document {
  id: number;
  title: string;
  description: string;
  category?: DocumentCategory;
  file?: string | null;
  file_name?: string;
  file_size?: string;
  uploaded_by?: any;
  uploaded_by_name?: string;
  is_active: boolean;
  created_at: string;
}

export type NotificationType = 'GENERAL' | 'PAYMENT' | 'COMPLAINT' | 'NOTICE' | 'SYSTEM' | 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';

export interface Notification {
  id: number;
  user?: number;
  user_name?: string;
  title: string;
  message: string;
  notification_type?: NotificationType;
  type?: NotificationType;
  is_read?: boolean;
  read?: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user?: any;
  user_name?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PAYMENT_RECEIVED' | 'VISITOR_CHECKIN' | string;
  module?: string;
  model_name?: string;
  record_id?: string | number;
  description?: string;
  details?: string;
  timestamp?: string;
  ip_address?: string;
  created_at: string;
}
