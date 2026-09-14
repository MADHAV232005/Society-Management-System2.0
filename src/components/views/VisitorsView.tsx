import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  LogOut,
  Clock,
  Car,
  Search,
  CheckCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { Visitor, Flat, UserRole, User as UserType } from '../../types';

interface VisitorsViewProps {
  visitors: Visitor[];
  flats: Flat[];
  onCheckIn: (data: {
    name: string;
    phone: string;
    visitor_type: Visitor['visitor_type'];
    purpose: string;
    flat_number: string;
    vehicle_number?: string;
  }) => void;
  onCheckOut: (id: number) => void;
  userRole?: UserRole;
  currentUser?: UserType | null;
}

export const VisitorsView: React.FC<VisitorsViewProps> = ({
  visitors,
  flats,
  onCheckIn,
  onCheckOut,
  userRole = 'SUPER_ADMIN',
  currentUser,
}) => {
  const isResident = userRole === 'RESIDENT';
  const canCheckOut = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE' || userRole === 'SECURITY';

  const residentFlatNumber =
    currentUser?.resident_profile?.flat_number ||
    (currentUser?.role === 'RESIDENT' ? '101' : flats[0]?.flat_number || 'A-101');

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'INSIDE' | 'CHECKED_OUT'>('ALL');

  // Check in form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitorType, setVisitorType] = useState<Visitor['visitor_type']>('GUEST');
  const [purpose, setPurpose] = useState('Meeting resident');
  const [flatNumber, setFlatNumber] = useState<string>(residentFlatNumber);
  const [vehicleNumber, setVehicleNumber] = useState('');

  const insideCount = visitors.filter((v) => v.status === 'INSIDE' || v.status === 'CHECKED_IN').length;

  const filteredVisitors = visitors.filter((v) => {
    const isInside = v.status === 'INSIDE' || v.status === 'CHECKED_IN';
    const isCheckedOut = v.status === 'CHECKED_OUT';
    const matchesTab =
      statusTab === 'ALL' ||
      (statusTab === 'INSIDE' && isInside) ||
      (statusTab === 'CHECKED_OUT' && isCheckedOut);

    const vName = v.visitor_name || v.name || '';
    const vFlat = v.flat_number || '';
    const vPhone = v.phone || '';
    const vVehicle = v.vehicle_number || '';

    const matchesSearch =
      vName.toLowerCase().includes(search.toLowerCase()) ||
      vFlat.toLowerCase().includes(search.toLowerCase()) ||
      vPhone.includes(search) ||
      vVehicle.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onCheckIn({
      name: name.trim(),
      phone: phone.trim(),
      visitor_type: visitorType,
      purpose: purpose.trim(),
      flat_number: flatNumber,
      vehicle_number: vehicleNumber.trim() || undefined,
    });
    setName('');
    setPhone('');
    setVehicleNumber('');
    setShowCheckInModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-700">Currently Inside Society</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{insideCount}</p>
            <span className="text-[10px] text-slate-400">At premises</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Entries Logged</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{visitors.length}</p>
            <span className="text-[10px] text-slate-400">Logged gate entries</span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              {isResident ? 'My Flat Unit' : 'Security Gate Guard'}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {isResident ? `Flat ${residentFlatNumber}` : 'Ramesh Yadav'}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              {isResident ? 'Pre-approval enabled' : 'Gate 1 • On Duty'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCheckInModal(true)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isResident ? 'Invite Guest' : 'Gate Entry'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusTab === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Logs ({visitors.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('INSIDE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusTab === 'INSIDE'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Inside Now ({insideCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('CHECKED_OUT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusTab === 'CHECKED_OUT'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Checked Out
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search visitor, flat, vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Visitor Info</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Flat & Purpose</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Entry Time</th>
                <th className="px-4 py-3">Exit Time</th>
                <th className="px-4 py-3 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{v.visitor_name || v.name}</span>
                    <span className="text-[11px] text-slate-400">{v.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {v.visit_type || v.visitor_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">Flat {v.flat_number}</span>
                    <span className="text-[11px] text-slate-500 block">{v.purpose}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                    {v.vehicle_number || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {v.entry_time || (v.checked_in_at ? new Date(v.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {v.exit_time || (v.checked_out_at ? new Date(v.checked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.status === 'INSIDE' || v.status === 'CHECKED_IN' ? (
                      canCheckOut ? (
                        <button
                          type="button"
                          onClick={() => onCheckOut(v.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Check Out</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-medium">Inside Society</span>
                      )
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {isResident ? 'Pre-Register Expected Visitor' : 'Gate Pass Check-In'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kadam"
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
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Visitor Type</label>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value as Visitor['visitor_type'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="GUEST">Guest / Relative</option>
                    <option value="DELIVERY">Delivery (Amazon, Swiggy, etc)</option>
                    <option value="CAB">Cab / Taxi (Uber, Ola)</option>
                    <option value="SERVICE">Service (Plumber, Urban Co)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Destination Flat</label>
                  {isResident ? (
                    <input
                      type="text"
                      value={`Flat ${residentFlatNumber}`}
                      disabled
                      className="w-full text-xs border border-slate-200 bg-slate-100 text-slate-600 rounded-lg px-3 py-2 cursor-not-allowed font-medium"
                    />
                  ) : (
                    <select
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    >
                      {flats.map((f) => (
                        <option key={f.id} value={f.flat_number}>
                          {f.flat_number} ({f.wing_name})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Plate (Optional)</label>
                  <input
                    type="text"
                    placeholder="MH-04-AB-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Courier drop off, dinner visit"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  {isResident ? 'Pre-Register Visitor' : 'Confirm Gate Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
