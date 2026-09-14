import React, { useState } from 'react';
import { useSocietyStore } from './store';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
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

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    switchUserRole,
    resetToSampleData,
  } = useSocietyStore();

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
        onSwitchRole={switchUserRole}
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

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openComplaintsCount={openComplaintsCount}
          visitorsInsideCount={visitorsInsideCount}
          pendingBillsCount={pendingBillsCount}
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
            />
          )}

          {currentTab === 'society' && (
            <SocietyView
              society={society}
              wings={wings}
              flats={flats}
              onAddWing={addWing}
              onAddFlat={addFlat}
            />
          )}

          {currentTab === 'residents' && (
            <ResidentsView
              residents={residents}
              flats={flats}
              onAddResident={addResident}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              bills={bills}
              payments={payments}
              flats={flats}
              onCreateBill={createMaintenanceBill}
              onRecordPayment={recordPayment}
            />
          )}

          {currentTab === 'complaints' && (
            <ComplaintsView
              complaints={complaints}
              flats={flats}
              staff={staff}
              onAddComplaint={addComplaint}
              onUpdateStatus={updateComplaintStatus}
            />
          )}

          {currentTab === 'visitors' && (
            <VisitorsView
              visitors={visitors}
              flats={flats}
              onCheckIn={checkInVisitor}
              onCheckOut={checkOutVisitor}
            />
          )}

          {currentTab === 'notices' && (
            <NoticesView
              notices={notices}
              onAddNotice={addNotice}
              onDeleteNotice={deleteNotice}
            />
          )}

          {currentTab === 'staff' && (
            <StaffView
              staff={staff}
              onAddStaff={addStaff}
              onToggleStatus={toggleStaffStatus}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onAddExpense={addExpense}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={addDocument}
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
        currentRole={currentUser.role}
      />
    </div>
  );
}

export default App;
