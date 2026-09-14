import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  User,
  Filter,
} from 'lucide-react';
import { Complaint, Flat, Staff, UserRole, User as UserType } from '../../types';

interface ComplaintsViewProps {
  complaints: Complaint[];
  flats: Flat[];
  staff: Staff[];
  onAddComplaint: (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    flat_number: string;
  }) => void;
  onUpdateStatus: (
    id: number,
    status: Complaint['status'],
    assigned_to?: string,
    resolution_notes?: string
  ) => void;
  userRole?: UserRole;
  currentUser?: UserType | null;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  complaints,
  flats,
  staff,
  onAddComplaint,
  onUpdateStatus,
  userRole = 'SUPER_ADMIN',
  currentUser,
}) => {
  const isResident = userRole === 'RESIDENT';
  const canManageComplaints = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';

  const residentFlatNumber =
    currentUser?.resident_profile?.flat_number ||
    (currentUser?.role === 'RESIDENT' ? '101' : flats[0]?.flat_number || 'A-101');

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // New complaint state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('PLUMBING');
  const [priority, setPriority] = useState<Complaint['priority']>('MEDIUM');
  const [flatNumber, setFlatNumber] = useState<string>(residentFlatNumber);

  // Status update modal state
  const [newStatus, setNewStatus] = useState<Complaint['status']>('IN_PROGRESS');
  const [assignedTo, setAssignedTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAddComplaint({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      flat_number: flatNumber,
    });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleOpenStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAssignedTo(complaint.assigned_to || '');
    setResolutionNotes(complaint.resolution_notes || '');
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    onUpdateStatus(
      selectedComplaint.id,
      newStatus,
      assignedTo || undefined,
      resolutionNotes || undefined
    );
    setSelectedComplaint(null);
  };

  const getPriorityBadge = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {isResident ? 'My Flat Complaints & Tickets' : 'Complaints & Helpdesk'}
          </h2>
          <p className="text-xs text-slate-500">
            {isResident
              ? 'Lodge and track maintenance requests for your apartment unit'
              : 'Resident maintenance tickets and service grievances'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Statuses ({complaints.length})</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="LIFT">Elevator / Lift</option>
            <option value="WATER">Water Supply</option>
            <option value="SECURITY">Security</option>
            <option value="OTHER">Other</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-medium text-white hover:bg-rose-700 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lodge Complaint</span>
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No complaints found matching the criteria.
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-shadow shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                        {c.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getPriorityBadge(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <span>Unit: <strong className="text-slate-700">{c.flat_number}</strong></span>
                      <span>By: <strong className="text-slate-700">{c.created_by}</strong></span>
                      {c.assigned_to && (
                        <span>Assigned to: <strong className="text-sky-700">{c.assigned_to}</strong></span>
                      )}
                    </div>
                    {c.resolution_notes && (
                      <div className="mt-2 text-xs bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-emerald-800">
                        <strong>Resolution:</strong> {c.resolution_notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      c.status
                    )}`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                  {canManageComplaints && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(c)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-medium underline"
                    >
                      Update Status &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lodge Complaint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Lodge Maintenance Complaint</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Water leakage in ceiling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="LIFT">Lift</option>
                    <option value="WATER">Water</option>
                    <option value="SECURITY">Security</option>
                    <option value="PARKING">Parking</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Complaint['priority'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Flat</label>
                  <select
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.flat_number}>
                        {f.flat_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Complaint Status Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Update Ticket #{selectedComplaint.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedComplaint.title}</p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Workflow Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Complaint['status'])}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign Technician / Staff</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={`${s.name} (${s.role})`}>
                      {s.name} - {s.role}
                    </option>
                  ))}
                  <option value="External Contractor">External Contractor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Resolution Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Details of work completed..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
