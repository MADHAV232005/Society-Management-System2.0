import React, { useState } from 'react';
import { Briefcase, Plus, Phone, Calendar, ShieldCheck, Wrench, Sparkles, UserCheck } from 'lucide-react';
import { Staff, UserRole } from '../../types';

interface StaffViewProps {
  staff: Staff[];
  onAddStaff: (data: Omit<Staff, 'id' | 'joined_date'>) => void;
  onToggleStatus: (id: number) => void;
  userRole?: UserRole;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staff,
  onAddStaff,
  onToggleStatus,
  userRole = 'SUPER_ADMIN',
}) => {
  const canManageStaff = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Staff['role']>('SECURITY_GUARD');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState<Staff['shift']>('MORNING');
  const [assignedWing, setAssignedWing] = useState('Main Gate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const staffType = role === 'SECURITY_GUARD' ? 'SECURITY' : role === 'CLEANER' ? 'CLEANING' : role === 'ELECTRICIAN' || role === 'PLUMBER' ? 'MAINTENANCE' : role === 'GARDENER' ? 'GARDENER' : 'OTHER';
    onAddStaff({
      name: name.trim(),
      staff_type: staffType,
      role,
      phone: phone.trim(),
      shift,
      address: assignedWing.trim() || 'Society Premises',
      assigned_wing: assignedWing.trim() || undefined,
      salary: 18000,
      joining_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'SECURITY_GUARD':
      case 'SECURITY':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'ELECTRICIAN':
      case 'PLUMBER':
      case 'MAINTENANCE':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'CLEANER':
      case 'CLEANING':
      case 'GARDENER':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Staff & Security Directory</h2>
          <p className="text-xs text-slate-500">
            Guards, housekeeping, electricians, plumbers, and administrative personnel
          </p>
        </div>
        {canManageStaff && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-100">{getRoleIcon(s.role || s.staff_type)}</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                    <span className="text-xs font-medium text-slate-500">
                      {(s.role || s.staff_type || 'STAFF').replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {canManageStaff ? (
                  <button
                    type="button"
                    onClick={() => onToggleStatus(s.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${
                      s.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                    title="Click to toggle active status"
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </button>
                ) : (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      s.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Shift</span>
                  <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {s.shift || 'GENERAL'} SHIFT
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assignment</span>
                  <span className="font-medium text-slate-800">{s.assigned_wing || s.address || 'General'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {s.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-50 text-[10px] text-slate-400">
              Joined {s.joined_date || s.joining_date || 'Active'}
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Register Staff Member</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Staff['role'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="SECURITY_GUARD">Security Guard</option>
                    <option value="ELECTRICIAN">Electrician</option>
                    <option value="PLUMBER">Plumber</option>
                    <option value="CLEANER">Cleaner / Housekeeping</option>
                    <option value="GARDENER">Gardener</option>
                    <option value="MANAGER">Society Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as Staff['shift'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="MORNING">Morning (7 AM - 3 PM)</option>
                    <option value="EVENING">Evening (3 PM - 11 PM)</option>
                    <option value="NIGHT">Night (11 PM - 7 AM)</option>
                    <option value="GENERAL">General (9 AM - 6 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Gate, A Wing"
                    value={assignedWing}
                    onChange={(e) => setAssignedWing(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
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
                  className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
