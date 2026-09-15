import {
  User,
  Society,
  Wing,
  Flat,
  Resident,
  MaintenanceBill,
  Payment,
  Receipt,
  Complaint,
  ComplaintStatusHistory,
  Visitor,
  Notice,
  Staff,
  Expense,
  Document,
  Notification,
  AuditLog,
} from '../types';

function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '') as string;
  if (!envUrl || envUrl.trim() === '') {
    return '/api';
  }
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  if (cleaned === '' || cleaned === '/api') {
    return '/api';
  }
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
}

export const API_BASE = getApiBaseUrl();

export const TOKEN_KEYS = {
  ACCESS: 'sms_access_token',
  REFRESH: 'sms_refresh_token',
};

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEYS.ACCESS, access);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired, try refreshing
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refresh = localStorage.getItem(TOKEN_KEYS.REFRESH);
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem(TOKEN_KEYS.ACCESS, refreshData.access);
          headers['Authorization'] = `Bearer ${refreshData.access}`;
          response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          clearTokens();
          window.location.reload();
        }
      } catch {
        clearTokens();
        window.location.reload();
      }
    }
  }

  if (!response.ok) {
    let errMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (typeof errData === 'object' && errData !== null) {
        errMessage = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      }
    } catch {
      // ignore
    }
    if (response.status === 403 && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('api-forbidden', {
          detail: {
            status: 403,
            message: errMessage || 'Permission Denied: You do not have permission to perform this action.',
            endpoint,
          },
        })
      );
    }
    const err: any = new Error(errMessage);
    err.status = response.status;
    throw err;
  }

  // Check if no content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    const data = await request<{ access: string; refresh: string; user: User }>(
      '/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
    setTokens(data.access, data.refresh);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/auth/me/');
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/users/');
  },

  // Society
  async getSocieties(): Promise<Society[]> {
    return request<Society[]>('/societies/');
  },

  async updateSociety(id: number, data: Partial<Society>): Promise<Society> {
    return request<Society>(`/societies/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Wings
  async getWings(): Promise<Wing[]> {
    return request<Wing[]>('/wings/');
  },

  async createWing(data: { society: number; name: string }): Promise<Wing> {
    return request<Wing>('/wings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Flats
  async getFlats(): Promise<Flat[]> {
    return request<Flat[]>('/flats/');
  },

  async createFlat(data: Partial<Flat>): Promise<Flat> {
    return request<Flat>('/flats/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFlat(id: number, data: Partial<Flat>): Promise<Flat> {
    return request<Flat>(`/flats/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Residents
  async getResidents(): Promise<Resident[]> {
    return request<Resident[]>('/residents/');
  },

  async createResident(data: {
    user: number;
    flat: number;
    is_primary?: boolean;
    is_active?: boolean;
    move_in_date: string;
  }): Promise<Resident> {
    return request<Resident>('/residents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Billing
  async getBills(): Promise<MaintenanceBill[]> {
    return request<MaintenanceBill[]>('/maintenance-bills/');
  },

  async createBill(data: {
    flat: number;
    billing_month: string;
    due_date: string;
    amount: number | string;
    description: string;
    status?: string;
  }): Promise<MaintenanceBill> {
    return request<MaintenanceBill>('/maintenance-bills/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Payments & Receipts
  async getPayments(): Promise<Payment[]> {
    return request<Payment[]>('/payments/');
  },

  async createPayment(data: {
    bill: number;
    amount: number | string;
    payment_date: string;
    payment_method: string;
    transaction_reference: string;
    notes?: string;
  }): Promise<Payment> {
    return request<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReceipts(): Promise<Receipt[]> {
    return request<Receipt[]>('/receipts/');
  },

  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    return request<Complaint[]>('/complaints/');
  },

  async createComplaint(data: {
    category: string;
    title: string;
    description: string;
    priority: string;
    flat?: number;
    resident?: number;
  }): Promise<Complaint> {
    return request<Complaint>('/complaints/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateComplaint(id: number, data: Partial<Complaint> & { remarks?: string }): Promise<Complaint> {
    return request<Complaint>(`/complaints/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getComplaintHistory(): Promise<ComplaintStatusHistory[]> {
    return request<ComplaintStatusHistory[]>('/complaint-history/');
  },

  // Visitors
  async getVisitors(): Promise<Visitor[]> {
    return request<Visitor[]>('/visitors/');
  },

  async createVisitor(data: {
    visitor_name: string;
    phone: string;
    flat?: number;
    visit_type: string;
    purpose: string;
    vehicle_number?: string;
    status?: string;
  }): Promise<Visitor> {
    return request<Visitor>('/visitors/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVisitor(id: number, data: Partial<Visitor>): Promise<Visitor> {
    return request<Visitor>(`/visitors/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Notices
  async getNotices(): Promise<Notice[]> {
    return request<Notice[]>('/notices/');
  },

  async createNotice(data: {
    title: string;
    content: string;
    notice_type: string;
    priority: string;
    expiry_date?: string | null;
  }): Promise<Notice> {
    return request<Notice>('/notices/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteNotice(id: number): Promise<void> {
    return request<void>(`/notices/${id}/`, {
      method: 'DELETE',
    });
  },

  // Staff
  async getStaff(): Promise<Staff[]> {
    return request<Staff[]>('/staff/');
  },

  async createStaff(data: {
    name: string;
    phone: string;
    staff_type: string;
    address: string;
    joining_date: string;
    salary: number | string;
  }): Promise<Staff> {
    return request<Staff>('/staff/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return request<Expense[]>('/expenses/');
  },

  async createExpense(data: {
    title: string;
    description: string;
    category: string;
    amount: number | string;
    expense_date: string;
    vendor_name: string;
    invoice_number: string;
  }): Promise<Expense> {
    return request<Expense>('/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Documents
  async getDocuments(): Promise<Document[]> {
    return request<Document[]>('/documents/');
  },

  async createDocument(data: {
    title: string;
    description: string;
  }): Promise<Document> {
    return request<Document>('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return request<Notification[]>('/notifications/');
  },

  async markNotificationRead(id: number): Promise<Notification> {
    return request<Notification>(`/notifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/audit-logs/');
  },
};
