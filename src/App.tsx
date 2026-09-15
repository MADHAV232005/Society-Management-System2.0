import React, { useState, useEffect } from 'react';
import { useSocietyStore } from './store';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType, allowedNavIdsByRole } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { SocietyView } from './components/views/SocietyView';
import { ResidentsView } from './components/views/ResidentsView';
import { BillingView } from './components/views/BillingView';
import { ComplaintsView } from './components/views/ComplaintsView';
import { VisitorsView } from './components/views/VisitorsView';
import { NoticesView } from './components/views/NoticesView';
import { StaffView } from './components/views/StaffView';
import { ExpensesView } from './components/views/ExpensesView';
import { DocumentsView } from './components/views/DocumentsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { ApiExplorerView } from './components/views/ApiExplorerView';
import { LoginModal } from './components/LoginModal';
import { ShieldAlert, X } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [forbiddenToast, setForbiddenToast] = useState<{ message: string; endpoint?: string } | null>(null);

  const {
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
    currentUser,
    notifications,
    isLoading,
    login,
    logout,
    addWing,
    addFlat,
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
  } = useSocietyStore();

  const userRole = currentUser?.role || 'SUPER_ADMIN';

  // Automatically ensure currentTab is permitted for the active role
  useEffect(() => {
    const allowed = allowedNavIdsByRole[userRole] || allowedNavIdsByRole.SUPER_ADMIN;
    if (!allowed.includes(currentTab)) {
      setCurrentTab(allowed[0]);
    }
  }, [userRole, currentTab]);

  // Listen for 403 Forbidden events from the API client
  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const customEvent = e as CustomEvent;
      setForbiddenToast({
        message: customEvent.detail?.message || 'Access Denied: Your role does not have permission to perform this action.',
        endpoint: customEvent.detail?.endpoint,
      });
      const timer = setTimeout(() => {
        setForbiddenToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('api-forbidden', handleForbidden);
    return () => window.removeEventListener('api-forbidden', handleForbidden);
  }, []);

  const openComplaintsCount = complaints.filter(
    (c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
  ).length;

  const visitorsInsideCount = visitors.filter((v) => v.status === 'INSIDE').length;
  const pendingBillsCount = bills.filter(
    (b) => b.status === 'PENDING' || b.status === 'OVERDUE' || b.status === 'PARTIAL'
  ).length;

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'visitor':
        setCurrentTab('visitors');
        break;
      case 'complaint':
        setCurrentTab('complaints');
        break;
      case 'bill':
        setCurrentTab('billing');
        break;
      case 'notice':
        setCurrentTab('notices');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        societyName={society.name}
        currentUser={currentUser}
        onLogout={logout}
        notifications={notifications}
        onResetData={resetToSampleData}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Syncing indicator */}
      {isLoading && (
        <div className="bg-sky-50 border-b border-sky-100 py-1 px-4 text-center text-xs text-sky-700 font-medium flex items-center justify-center space-x-2">
          <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing real-time data with Django REST Framework backend...</span>
        </div>
      )}

      {/* 403 Forbidden Toast Banner */}
      {forbiddenToast && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">HTTP 403 Permission Denied:</span>
            <span>{forbiddenToast.message}</span>
            {forbiddenToast.endpoint && (
              <span className="font-mono text-[10px] text-amber-700 bg-amber-100 px-1 py-0.5 rounded">
                {forbiddenToast.endpoint}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setForbiddenToast(null)}
            className="text-amber-600 hover:text-amber-800 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openComplaintsCount={openComplaintsCount}
          visitorsInsideCount={visitorsInsideCount}
          pendingBillsCount={pendingBillsCount}
          userRole={userRole}
        />

        {/* Content View */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              society={society}
              flats={flats}
              residents={residents}
              bills={bills}
              complaints={complaints}
              visitors={visitors}
              notices={notices}
              onNavigate={setCurrentTab}
              onOpenQuickAction={handleQuickAction}
              userRole={userRole}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'society' && (
            <SocietyView
              society={society}
              wings={wings}
              flats={flats}
              onAddWing={addWing}
              onAddFlat={addFlat}
              userRole={userRole}
            />
          )}

          {currentTab === 'residents' && (
            <ResidentsView
              residents={residents}
              flats={flats}
              onAddResident={addResident}
              userRole={userRole}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              bills={bills}
              payments={payments}
              flats={flats}
              onCreateBill={createMaintenanceBill}
              onRecordPayment={recordPayment}
              userRole={userRole}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'complaints' && (
            <ComplaintsView
              complaints={complaints}
              flats={flats}
              staff={staff}
              onAddComplaint={addComplaint}
              onUpdateStatus={updateComplaintStatus}
              userRole={userRole}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'visitors' && (
            <VisitorsView
              visitors={visitors}
              flats={flats}
              onCheckIn={checkInVisitor}
              onCheckOut={checkOutVisitor}
              userRole={userRole}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'notices' && (
            <NoticesView
              notices={notices}
              onAddNotice={addNotice}
              onDeleteNotice={deleteNotice}
              userRole={userRole}
            />
          )}

          {currentTab === 'staff' && (
            <StaffView
              staff={staff}
              onAddStaff={addStaff}
              onToggleStatus={toggleStaffStatus}
              userRole={userRole}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onAddExpense={addExpense}
              userRole={userRole}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={addDocument}
              userRole={userRole}
            />
          )}

          {currentTab === 'auditlogs' && (
            <AuditLogsView auditLogs={auditLogs} />
          )}

          {currentTab === 'api-explorer' && (
            <ApiExplorerView
              society={society}
              wings={wings}
              flats={flats}
              residents={residents}
              bills={bills}
              payments={payments}
              complaints={complaints}
              visitors={visitors}
              notices={notices}
              staff={staff}
              expenses={expenses}
              documents={documents}
              auditLogs={auditLogs}
            />
          )}
        </main>
      </div>

      {/* Django JWT Authentication Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={login}
        onLoginSuccess={() => setShowLoginModal(false)}
        currentRole={currentUser?.role}
      />
    </div>
  );
}

export default App;
