import React from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  Receipt,
  MessageSquareWarning,
  UserCheck,
  Megaphone,
  Briefcase,
  TrendingDown,
  FileText,
  History,
  Code2,
  ShieldCheck,
  Shield,
  Home,
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType =
  | 'dashboard'
  | 'society'
  | 'residents'
  | 'billing'
  | 'complaints'
  | 'visitors'
  | 'notices'
  | 'staff'
  | 'expenses'
  | 'documents'
  | 'auditlogs'
  | 'api-explorer';

export const allowedNavIdsByRole: Record<UserRole, TabType[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'society',
    'residents',
    'billing',
    'complaints',
    'visitors',
    'notices',
    'staff',
    'expenses',
    'documents',
    'auditlogs',
    'api-explorer',
  ],
  COMMITTEE: [
    'dashboard',
    'society',
    'residents',
    'billing',
    'complaints',
    'visitors',
    'notices',
    'staff',
    'expenses',
    'documents',
    'auditlogs',
    'api-explorer',
  ],
  RESIDENT: [
    'dashboard',
    'billing',
    'complaints',
    'visitors',
    'notices',
    'documents',
  ],
  SECURITY: [
    'visitors',
    'dashboard',
    'society',
    'notices',
  ],
};

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  openComplaintsCount: number;
  visitorsInsideCount: number;
  pendingBillsCount: number;
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openComplaintsCount,
  visitorsInsideCount,
  pendingBillsCount,
  userRole = 'SUPER_ADMIN',
}) => {
  const isResident = userRole === 'RESIDENT';
  const isSecurity = userRole === 'SECURITY';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'society', label: isSecurity ? 'Wings & Flat Lookup' : 'Wings & Flats', icon: Building },
    { id: 'residents', label: 'Residents Directory', icon: Users },
    {
      id: 'billing',
      label: isResident ? 'My Bills & Receipts' : 'Billing & Dues',
      icon: Receipt,
      badge: pendingBillsCount > 0 ? pendingBillsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'complaints',
      label: isResident ? 'My Complaints' : 'Complaints',
      icon: MessageSquareWarning,
      badge: openComplaintsCount > 0 ? openComplaintsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'visitors',
      label: isResident ? 'My Flat Visitors' : 'Gate & Visitors',
      icon: UserCheck,
      badge: visitorsInsideCount > 0 ? `${visitorsInsideCount} inside` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    { id: 'notices', label: 'Notices & Circulars', icon: Megaphone },
    { id: 'staff', label: 'Staff & Security', icon: Briefcase },
    { id: 'expenses', label: 'Expenses & Accounts', icon: TrendingDown },
    { id: 'documents', label: 'Documents & Bylaws', icon: FileText },
    { id: 'auditlogs', label: 'Audit Trail & Logs', icon: History },
    { id: 'api-explorer', label: 'Django API Explorer', icon: Code2, highlight: true },
  ];

  const allowedTabs = allowedNavIdsByRole[userRole] || allowedNavIdsByRole.SUPER_ADMIN;
  const visibleNavItems = navItems.filter((item) => allowedTabs.includes(item.id as TabType));

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Full Administrator Access';
      case 'COMMITTEE':
        return 'Committee Management';
      case 'RESIDENT':
        return 'Resident Member Portal';
      case 'SECURITY':
        return 'Gate Security Access';
      default:
        return 'Authenticated User';
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        {/* Role Access Scope Badge */}
        <div className="px-3 py-2 mb-2 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-1.5">
            {userRole === 'SUPER_ADMIN' && <Shield className="w-3.5 h-3.5 text-purple-600" />}
            {userRole === 'COMMITTEE' && <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />}
            {userRole === 'RESIDENT' && <Home className="w-3.5 h-3.5 text-amber-600" />}
            {userRole === 'SECURITY' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="text-[11px] font-bold tracking-wider text-slate-800 uppercase">
              {userRole}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{getRoleDescription(userRole)}</p>
        </div>

        <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation ({visibleNavItems.length})
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold border-l-2 border-sky-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${item.highlight && !isActive ? 'text-sky-600 font-semibold' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-sky-600'
                      : item.highlight
                      ? 'text-sky-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Backend Status footer */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Environment</span>
          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
            Node 22 / Port 3000
          </span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-slate-400">Endpoints</span>
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            15 DRF Routes
          </span>
        </div>
      </div>
    </aside>
  );
};
