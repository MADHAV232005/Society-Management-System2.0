import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Home,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { Resident, Flat, UserRole } from '../../types';

interface ResidentsViewProps {
  residents: Resident[];
  flats: Flat[];
  onAddResident: (data: Omit<Resident, 'id'>) => void;
  userRole?: UserRole;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  residents,
  flats,
  onAddResident,
  userRole = 'SUPER_ADMIN',
}) => {
  const canAddResident = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFlatId, setSelectedFlatId] = useState<number>(flats[0]?.id || 1);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrimary, setIsPrimary] = useState(true);

  const filteredResidents = residents.filter((r) => {
    const rName = r.name || r.user_name || r.username || '';
    const rFlat = r.flat_number || '';
    const rPhone = r.phone || '';
    return (
      rName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rFlat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rPhone.includes(searchQuery)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const flat = flats.find((f) => f.id === Number(selectedFlatId)) || flats[0];
    onAddResident({
      user: flat ? flat.id : 1,
      user_id: flat ? flat.id : 1,
      flat: flat ? flat.id : 1,
      flat_id: flat ? flat.id : 1,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      flat_number: flat?.flat_number || '',
      wing_name: flat?.wing_name || '',
      is_primary: isPrimary,
      is_active: true,
      move_in_date: moveInDate,
    });

    setName('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Resident Directory</h2>
          <p className="text-xs text-slate-500">
            Registered society members, homeowners, and tenants
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search by name, flat, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white w-64 shadow-2xs"
          />
          {canAddResident && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Resident</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Resident Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                  {(r.name || r.user_name || 'Resident').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {r.name || r.user_name || r.username || 'Resident'}
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      Flat {r.flat_number || 'N/A'}
                    </span>
                    {r.is_primary && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Primary Owner
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{r.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{r.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Moved in: {r.move_in_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Enroll New Resident</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Flat</label>
                  <select
                    value={selectedFlatId}
                    onChange={(e) => setSelectedFlatId(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.flat_number} ({f.wing_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Move In Date</label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="primary_res"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="primary_res" className="text-xs text-slate-700">
                  Is Primary Resident / Flat Owner
                </label>
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
                  Enroll Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
