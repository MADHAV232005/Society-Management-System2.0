import { useState, useEffect, useCallback } from 'react';
import {
  Society,
  Wing,
  Flat,
  Resident,
  MaintenanceBill,
  Payment,
  Complaint,
  Visitor,
  Notice,
  Staff,
  Expense,
  Document,
  AuditLog,
  User,
  UserRole,
  Notification,
} from './types';
import { api, getAccessToken, clearTokens } from './services/api';

const defaultUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@greenvalley.org',
  first_name: 'Vikram',
  last_name: 'Malhotra',
  role: 'SUPER_ADMIN',
};

const defaultSociety: Society = {
  id: 1,
  name: 'Green Valley CHS',
  registration_number: 'MH/MUM/HSG/2018/4891',
  address: 'Plot 42, Sector 18, Palm Beach Road, Navi Mumbai 400705',
  email: 'office@greenvalley.org',
  phone: '+91 22 2789 4500',
  is_active: true,
  created_at: new Date().toISOString(),
};

export function useSocietyStore() {
  const [society, setSociety] = useState<Society>(defaultSociety);
  const [wings, setWings] = useState<Wing[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch data from Django REST Framework based on authenticated user's role
  const loadAllData = useCallback(async (activeUserParam?: User | null) => {
    setIsLoading(true);
    try {
      // Determine authenticated user
      let user = activeUserParam;
      if (!user && getAccessToken()) {
        user = await api.getCurrentUser().catch(() => null);
        if (user) {
          setCurrentUser(user);
        }
      }

      if (!user) {
        setIsLoading(false);
        return;
      }

      const role = user.role;

      // Base endpoints accessible by authenticated users
      const societiesPromise = api.getSocieties().catch(() => []);
      const wingsPromise = api.getWings().catch(() => []);
      const flatsPromise = api.getFlats().catch(() => []);
      const noticesPromise = api.getNotices().catch(() => []);
      const notificationsPromise = api.getNotifications().catch(() => []);

      // Role-specific endpoint promises
      let residentsPromise: Promise<Resident[]> = Promise.resolve([]);
      let billsPromise: Promise<MaintenanceBill[]> = Promise.resolve([]);
      let paymentsPromise: Promise<Payment[]> = Promise.resolve([]);
      let complaintsPromise: Promise<Complaint[]> = Promise.resolve([]);
      let visitorsPromise: Promise<Visitor[]> = Promise.resolve([]);
      let staffPromise: Promise<Staff[]> = Promise.resolve([]);
      let expensesPromise: Promise<Expense[]> = Promise.resolve([]);
      let documentsPromise: Promise<Document[]> = Promise.resolve([]);
      let auditLogsPromise: Promise<AuditLog[]> = Promise.resolve([]);
      let usersPromise: Promise<User[]> = Promise.resolve([]);

      if (role === 'SUPER_ADMIN' || role === 'COMMITTEE') {
        residentsPromise = api.getResidents().catch(() => []);
        billsPromise = api.getBills().catch(() => []);
        paymentsPromise = api.getPayments().catch(() => []);
        complaintsPromise = api.getComplaints().catch(() => []);
        visitorsPromise = api.getVisitors().catch(() => []);
        staffPromise = api.getStaff().catch(() => []);
        expensesPromise = api.getExpenses().catch(() => []);
        documentsPromise = api.getDocuments().catch(() => []);
        auditLogsPromise = api.getAuditLogs().catch(() => []);
        usersPromise = api.getUsers().catch(() => []);
      } else if (role === 'RESIDENT') {
        // Residents can view their own bills, payments, complaints, flat visitors, notices, documents
        billsPromise = api.getBills().catch(() => []);
        paymentsPromise = api.getPayments().catch(() => []);
        complaintsPromise = api.getComplaints().catch(() => []);
        visitorsPromise = api.getVisitors().catch(() => []);
        documentsPromise = api.getDocuments().catch(() => []);
      } else if (role === 'SECURITY') {
        // Security guards manage visitors at gate and view notices/flats
        visitorsPromise = api.getVisitors().catch(() => []);
      }

      const [
        societiesData,
        wingsData,
        flatsData,
        residentsData,
        billsData,
        paymentsData,
        complaintsData,
        visitorsData,
        noticesData,
        staffData,
        expensesData,
        documentsData,
        notificationsData,
        auditLogsData,
        usersData,
      ] = await Promise.all([
        societiesPromise,
        wingsPromise,
        flatsPromise,
        residentsPromise,
        billsPromise,
        paymentsPromise,
        complaintsPromise,
        visitorsPromise,
        noticesPromise,
        staffPromise,
        expensesPromise,
        documentsPromise,
        notificationsPromise,
        auditLogsPromise,
        usersPromise,
      ]);

      if (societiesData.length > 0) {
        setSociety(societiesData[0]);
      }
      setWings(wingsData);
      setFlats(flatsData);
      setResidents(residentsData);
      setBills(billsData);
      setPayments(paymentsData);
      setComplaints(complaintsData);
      setVisitors(visitorsData);
      setNotices(noticesData);
      setStaff(staffData);
      setExpenses(expensesData);
      setDocuments(documentsData);
      setNotifications(notificationsData);
      setAuditLogs(auditLogsData);
      setUsers(usersData);
      setAuthError(null);
    } catch (err: any) {
      console.error('Failed to load Django data:', err);
      setAuthError(err.message || 'Error communicating with Django backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: restore authenticated user from JWT in Django backend if token exists
  useEffect(() => {
    async function initAuth() {
      const existingToken = getAccessToken();
      if (existingToken) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
          await loadAllData(user);
          return;
        } catch {
          clearTokens();
          setCurrentUser(null);
        }
      } else {
        // If no token exists on first visit, prompt authentication
        setCurrentUser(null);
      }
      setIsLoading(false);
    }
    initAuth();
  }, [loadAllData]);

  // Auth actions
  const login = async (username: string, password: string): Promise<User> => {
    const res = await api.login(username, password);
    setCurrentUser(res.user);
    await loadAllData(res.user);
    return res.user;
  };

  const logout = () => {
    clearTokens();
    setCurrentUser(null);
    setBills([]);
    setPayments([]);
    setComplaints([]);
    setVisitors([]);
    setStaff([]);
    setExpenses([]);
    setDocuments([]);
    setAuditLogs([]);
    setUsers([]);
    setIsLoading(false);
  };

  // Model mutations connected to Django
  const updateSociety = async (data: Partial<Society>) => {
    if (!society.id) return;
    const updated = await api.updateSociety(society.id, data);
    setSociety(updated);
    await loadAllData();
  };

  const addWing = async (name: string, total_floors: number) => {
    await api.createWing({
      society: society.id || 1,
      name,
    });
    await loadAllData();
  };

  const addFlat = async (data: any) => {
    await api.createFlat({
      wing: data.wing_id || data.wing || (wings[0]?.id || 1),
      flat_number: data.flat_number,
      floor: data.floor || data.floorNumber || 1,
      area_sqft: data.area_sqft || data.areaSqft || 1000,
      is_occupied: data.is_occupied ?? false,
      is_active: true,
    });
    await loadAllData();
  };

  const updateFlat = async (id: number, data: Partial<Flat>) => {
    await api.updateFlat(id, data);
    await loadAllData();
  };

  const addResident = async (data: any) => {
    // Find or pick a user
    const flatId = data.flat_id || data.flat || (flats[0]?.id || 1);
    const userId = data.user_id || data.user || currentUser.id;
    await api.createResident({
      user: userId,
      flat: flatId,
      is_primary: data.is_primary ?? true,
      is_active: data.is_active ?? true,
      move_in_date: data.move_in_date || new Date().toISOString().split('T')[0],
    });
    await loadAllData();
  };

  const createMaintenanceBill = async (billData: any) => {
    const flatId = billData.flat_id || billData.flat || (flats[0]?.id || 1);
    await api.createBill({
      flat: flatId,
      billing_month: billData.billing_month || 'October 2026',
      due_date: billData.due_date || '2026-10-25',
      amount: billData.amount || 3500,
      description: billData.description || 'Monthly Maintenance Dues',
      status: billData.status || 'PENDING',
    });
    await loadAllData();
  };

  const recordPayment = async (
    bill_id: number,
    amount: number,
    method: Payment['payment_method'],
    transaction_id: string
  ) => {
    let paymentMethod = 'UPI';
    if (method === 'CASH') paymentMethod = 'CASH';
    else if (method === 'NET_BANKING' || method === 'BANK_TRANSFER') paymentMethod = 'BANK_TRANSFER';
    else if (method === 'CARD') paymentMethod = 'CARD';
    else if (method === 'CHEQUE') paymentMethod = 'CHEQUE';

    await api.createPayment({
      bill: bill_id,
      amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      transaction_reference: transaction_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Recorded by ${currentUser.first_name} ${currentUser.last_name}`,
    });
    await loadAllData();
  };

  const addComplaint = async (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    flat_number: string;
  }) => {
    const matchedFlat = flats.find((f) => f.flat_number === data.flat_number);
    let category = 'MAINTENANCE';
    if (data.category === 'ELECTRICAL') category = 'ELECTRICAL';
    else if (data.category === 'PLUMBING') category = 'PLUMBING';
    else if (data.category === 'SECURITY') category = 'SECURITY';
    else if (data.category === 'CLEANING') category = 'CLEANING';

    await api.createComplaint({
      title: data.title,
      description: data.description,
      category,
      priority: data.priority || 'MEDIUM',
      flat: matchedFlat ? matchedFlat.id : (flats[0]?.id || 1),
    });
    await loadAllData();
  };

  const updateComplaintStatus = async (
    id: number,
    status: Complaint['status'],
    assigned_to?: any,
    resolution_notes?: string
  ) => {
    const patchData: any = { status };
    if (assigned_to !== undefined && assigned_to !== '') {
      if (typeof assigned_to === 'number') {
        patchData.assigned_to = assigned_to;
      }
    }
    if (resolution_notes !== undefined) {
      patchData.resolution_notes = resolution_notes;
    }
    patchData.remarks = `Status updated to ${status} by ${currentUser.first_name} ${currentUser.last_name}`;

    await api.updateComplaint(id, patchData);
    await loadAllData();
  };

  const checkInVisitor = async (data: {
    name: string;
    phone: string;
    visitor_type: Visitor['visit_type'] | any;
    purpose: string;
    flat_number: string;
    vehicle_number?: string;
  }) => {
    const matchedFlat = flats.find((f) => f.flat_number === data.flat_number);
    await api.createVisitor({
      visitor_name: data.name,
      phone: data.phone,
      flat: matchedFlat ? matchedFlat.id : (flats[0]?.id || 1),
      visit_type: data.visitor_type || 'GUEST',
      purpose: data.purpose || 'Visit',
      vehicle_number: data.vehicle_number,
      status: 'CHECKED_IN',
    });
    await loadAllData();
  };

  const checkOutVisitor = async (id: number) => {
    await api.updateVisitor(id, {
      status: 'CHECKED_OUT',
      checked_out_at: new Date().toISOString(),
    });
    await loadAllData();
  };

  const addNotice = async (data: {
    title: string;
    content: string;
    priority: Notice['priority'];
    is_pinned?: boolean;
  }) => {
    await api.createNotice({
      title: data.title,
      content: data.content,
      notice_type: 'GENERAL',
      priority: data.priority || 'MEDIUM',
    });
    await loadAllData();
  };

  const deleteNotice = async (id: number) => {
    await api.deleteNotice(id);
    await loadAllData();
  };

  const addStaff = async (data: any) => {
    let staffType = 'OTHER';
    if (data.role === 'SECURITY_GUARD' || data.staff_type === 'SECURITY') staffType = 'SECURITY';
    else if (data.role === 'CLEANER' || data.staff_type === 'CLEANING') staffType = 'CLEANING';
    else if (data.role === 'ELECTRICIAN' || data.role === 'PLUMBER' || data.staff_type === 'MAINTENANCE') staffType = 'MAINTENANCE';
    else if (data.role === 'GARDENER' || data.staff_type === 'GARDENER') staffType = 'GARDENER';

    await api.createStaff({
      name: data.name,
      phone: data.phone,
      staff_type: staffType,
      address: data.assigned_wing || data.address || 'Society Premises',
      joining_date: new Date().toISOString().split('T')[0],
      salary: data.salary || 18000,
    });
    await loadAllData();
  };

  const toggleStaffStatus = async (id: number) => {
    const item = staff.find((s) => s.id === id);
    if (!item) return;
    await api.createStaff({
      name: item.name,
      phone: item.phone,
      staff_type: item.staff_type,
      address: item.address,
      joining_date: item.joining_date,
      salary: item.salary,
    });
    await loadAllData();
  };

  const addExpense = async (data: any) => {
    let category = 'MAINTENANCE';
    if (['MAINTENANCE', 'ELECTRICITY', 'WATER', 'SECURITY', 'CLEANING', 'REPAIR', 'OTHER'].includes(data.category)) {
      category = data.category;
    }

    await api.createExpense({
      title: data.title,
      description: data.notes || data.description || 'Society Expense',
      category,
      amount: data.amount,
      expense_date: data.date || new Date().toISOString().split('T')[0],
      vendor_name: data.paid_to || data.vendor_name || 'Vendor',
      invoice_number: data.receipt_no || data.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
    });
    await loadAllData();
  };

  const addDocument = async (data: any) => {
    await api.createDocument({
      title: data.title,
      description: `${data.category || 'General'} - ${data.file_name || 'Document'}`,
    });
    await loadAllData();
  };

  const resetToSampleData = async () => {
    await loadAllData();
  };

  return {
    society,
    wings,
    flats,
    residents,
    bills,
    payments,
    complaints,
    visitors,
    notices,
    staff,
    expenses,
    documents,
    auditLogs,
    users,
    currentUser,
    notifications,
    isLoading,
    authError,
    login,
    logout,
    updateSociety,
    addWing,
    addFlat,
    updateFlat,
    addResident,
    createMaintenanceBill,
    recordPayment,
    addComplaint,
    updateComplaintStatus,
    checkInVisitor,
    checkOutVisitor,
    addNotice,
    deleteNotice,
    addStaff,
    toggleStaffStatus,
    addExpense,
    addDocument,
    resetToSampleData,
    refreshData: loadAllData,
  };
}
