import React from 'react';
import {
  Building2,
  Users,
  CreditCard,
  MessageSquareWarning,
  UserCheck,
  Megaphone,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { TabType } from '../Sidebar';
import {
  Society,
  Flat,
  Resident,
  MaintenanceBill,
  Complaint,
  Visitor,
  Notice,
  UserRole,
  User,
} from '../../types';

interface DashboardViewProps {
  society: Society;
  flats: Flat[];
  residents: Resident[];
  bills: MaintenanceBill[];
  complaints: Complaint[];
  visitors: Visitor[];
  notices: Notice[];
  onNavigate: (tab: TabType) => void;
  onOpenQuickAction: (action: string) => void;
  userRole?: UserRole;
  currentUser?: User | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  society,
  flats,
  residents,
  bills,
  complaints,
  visitors,
  notices,
  onNavigate,
  onOpenQuickAction,
  userRole = 'SUPER_ADMIN',
  currentUser,
}) => {
  const occupiedFlats = flats.filter((f) => f.is_occupied).length;
  const occupancyRate = flats.length > 0 ? Math.round((occupiedFlats / flats.length) * 100) : 0;

  const isResident = userRole === 'RESIDENT';
  const isSecurity = userRole === 'SECURITY';
  const canManageAdmin = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';

  // Role-filtered stats
  const residentFlatNumber = currentUser?.resident_profile?.flat_number;
  const residentBills = isResident && residentFlatNumber
    ? bills.filter((b) => b.flat_number === residentFlatNumber)
    : bills;
  const residentComplaints = isResident && residentFlatNumber
    ? complaints.filter((c) => c.flat_number === residentFlatNumber)
    : complaints;
  const residentVisitors = isResident && residentFlatNumber
    ? visitors.filter((v) => v.flat_number === residentFlatNumber)
    : visitors;

  const totalBilled = (isResident ? residentBills : bills).reduce((acc, b) => acc + Number(b.amount || 0), 0);
  const totalCollected = (isResident ? residentBills : bills).reduce((acc, b) => acc + Number(b.total_paid || 0), 0);
  const totalPending = (isResident ? residentBills : bills).reduce((acc, b) => acc + Number(b.pending_amount || 0), 0);

  const openComplaints = (isResident ? residentComplaints : complaints).filter(
    (c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
  );
  const visitorsInside = (isResident ? residentVisitors : visitors).filter(
    (v) => v.status === 'INSIDE' || v.status === 'CHECKED_IN'
  );
  const pinnedNotice = notices.find((n) => n.is_pinned || n.priority === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Pinned Notice Announcement */}
      {pinnedNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between shadow-2xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Pinned Announcement
                </span>
                <span className="text-[10px] font-medium bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  {pinnedNotice.priority}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-amber-950 mt-1">
                {pinnedNotice.title}
              </h4>
              <p className="text-xs text-amber-800 mt-1 max-w-3xl line-clamp-2">
                {pinnedNotice.content}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('notices')}
            className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline shrink-0 ml-4"
          >
            View all circulars &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Units & Occupancy */}
        <div
          onClick={() => onNavigate('society')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-shadow hover:shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Flats & Occupancy</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {occupiedFlats} <span className="text-sm font-normal text-slate-400">/ {flats.length}</span>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {occupancyRate}% occupied
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {residents.length} registered residents across {flats.length} flats
          </p>
        </div>

        {/* Card 2: Maintenance Collections */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-shadow hover:shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Maintenance Dues</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              ₹{totalCollected.toLocaleString()}
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              ₹{totalPending.toLocaleString()} pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total billed: ₹{totalBilled.toLocaleString()}
          </p>
        </div>

        {/* Card 3: Complaints */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-shadow hover:shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Complaints</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {openComplaints.length}
            </div>
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Needs attention
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {complaints.filter((c) => c.status === 'RESOLVED').length} resolved this cycle
          </p>
        </div>

        {/* Card 4: Visitors Inside */}
        <div
          onClick={() => onNavigate('visitors')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-shadow hover:shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gate & Visitors</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {visitorsInside.length}
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Inside society
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {visitors.length} total visitor entries today
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onOpenQuickAction('visitor')}
            className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors text-left"
          >
            <div className="p-2 rounded-md bg-sky-100 text-sky-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-900">
                {isResident ? 'Pre-register Guest' : 'Gate Check-in'}
              </span>
              <span className="block text-[11px] text-slate-500">
                {isResident ? 'Notify security gate' : 'Log guest / cab'}
              </span>
            </div>
          </button>

          {!isSecurity && (
            <button
              type="button"
              onClick={() => onOpenQuickAction('complaint')}
              className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-colors text-left"
            >
              <div className="p-2 rounded-md bg-rose-100 text-rose-700">
                <MessageSquareWarning className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-900">Lodge Complaint</span>
                <span className="block text-[11px] text-slate-500">Plumbing, lift, etc</span>
              </div>
            </button>
          )}

          {!isSecurity && (
            <button
              type="button"
              onClick={() => onOpenQuickAction('bill')}
              className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-900">
                  {isResident ? 'Pay Maintenance' : 'Generate Bill'}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {isResident ? 'Settle pending dues' : 'Create dues invoice'}
                </span>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenQuickAction('notice')}
            className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
          >
            <div className="p-2 rounded-md bg-amber-100 text-amber-700">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-900">
                {canManageAdmin ? 'Post Circular' : 'View Circulars'}
              </span>
              <span className="block text-[11px] text-slate-500">
                {canManageAdmin ? 'Broadcast notice' : 'Official society notices'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Two-Column Grid: Visitors Inside & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors currently inside */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Visitors Inside Society</h3>
              <p className="text-xs text-slate-500">Real-time gate security tracker</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('visitors')}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <span>Manage Gate</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {visitorsInside.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No visitors currently inside</p>
            ) : (
              visitorsInside.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-900">{v.name || v.visitor_name}</span>
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {v.visitor_type || v.visit_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visiting <strong className="text-slate-700">Flat {v.flat_number}</strong> • {v.purpose}
                    </p>
                    {v.vehicle_number && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Vehicle: {v.vehicle_number}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                      Inside
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      In: {v.entry_time || (v.checked_in_at ? new Date(v.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Open Tickets & Complaints</h3>
              <p className="text-xs text-slate-500">Maintenance & resident grievances</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('complaints')}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {openComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No open complaints! All tickets resolved.</p>
            ) : (
              openComplaints.slice(0, 4).map((c) => (
                <div key={c.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-900">{c.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c.priority === 'HIGH' || c.priority === 'CRITICAL' || c.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Flat {c.flat_number} • By {c.created_by || c.resident_name || 'Resident'}
                    </p>
                    {c.assigned_to && (
                      <p className="text-[11px] text-sky-600 mt-0.5 font-medium">
                        Assigned: {c.assigned_to_name || c.assigned_to}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      c.status === 'IN_PROGRESS'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
