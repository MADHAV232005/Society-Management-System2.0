import React, { useState } from 'react';
import {
  Building,
  Plus,
  Home,
  Layers,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Society, Wing, Flat, UserRole } from '../../types';

interface SocietyViewProps {
  society: Society;
  wings: Wing[];
  flats: Flat[];
  onAddWing: (name: string, total_floors: number) => void;
  onAddFlat: (flat: Omit<Flat, 'id'>) => void;
  userRole?: UserRole;
}

export const SocietyView: React.FC<SocietyViewProps> = ({
  society,
  wings,
  flats,
  onAddWing,
  onAddFlat,
  userRole = 'SUPER_ADMIN',
}) => {
  const canManageSociety = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';
  const [selectedWingFilter, setSelectedWingFilter] = useState<string>('ALL');
  const [showAddWingModal, setShowAddWingModal] = useState(false);
  const [showAddFlatModal, setShowAddFlatModal] = useState(false);

  // New Wing form state
  const [wingName, setWingName] = useState('');
  const [totalFloors, setTotalFloors] = useState(7);

  // New Flat form state
  const [flatWingId, setFlatWingId] = useState<number>(wings[0]?.id || 1);
  const [flatNumber, setFlatNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState(1);
  const [areaSqft, setAreaSqft] = useState(1050);
  const [isOccupied, setIsOccupied] = useState(false);

  const filteredFlats = selectedWingFilter === 'ALL'
    ? flats
    : flats.filter((f) => f.wing_name === selectedWingFilter);

  const handleCreateWing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wingName.trim()) return;
    onAddWing(wingName.trim(), totalFloors);
    setWingName('');
    setShowAddWingModal(false);
  };

  const handleCreateFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim()) return;
    const targetWing = wings.find((w) => w.id === Number(flatWingId)) || wings[0];
    onAddFlat({
      wing: targetWing ? targetWing.id : 1,
      wing_id: targetWing ? targetWing.id : 1,
      wing_name: targetWing?.name || '',
      flat_number: flatNumber.trim(),
      floor: floorNumber,
      area_sqft: areaSqft,
      is_occupied: isOccupied,
      is_active: true,
    });
    setFlatNumber('');
    setShowAddFlatModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Society Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">{society.name}</h2>
              <span className="text-xs bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded">
                Reg: {society.registration_number}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {society.address}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {society.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {society.phone}
              </span>
            </div>
          </div>
          {canManageSociety && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddWingModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wing</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddFlatModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Flat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {wings.map((w) => {
          const wingFlats = flats.filter((f) => f.wing === w.id || f.wing_id === w.id || f.wing_name === w.name);
          const occupiedCount = wingFlats.filter((f) => f.is_occupied).length;
          return (
            <div
              key={w.id}
              className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{w.name}</h4>
                  <p className="text-xs text-slate-500">{w.total_floors || 7} Floors</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">
                  {occupiedCount} / {wingFlats.length}
                </span>
                <span className="block text-[10px] text-slate-400">Occupied Flats</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flats Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Flats Directory</h3>
            <p className="text-xs text-slate-500">Unit breakdown, occupancy, and floor plan</p>
          </div>

          {/* Wing Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Filter Wing:</span>
            <select
              value={selectedWingFilter}
              onChange={(e) => setSelectedWingFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700"
            >
              <option value="ALL">All Wings ({flats.length})</option>
              {wings.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Flat Number</th>
                <th className="px-4 py-3">Wing</th>
                <th className="px-4 py-3">Floor</th>
                <th className="px-4 py-3">Area (sq.ft)</th>
                <th className="px-4 py-3">Occupancy</th>
                <th className="px-4 py-3">Resident / Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFlats.map((flat) => (
                <tr key={flat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    {flat.flat_number}
                  </td>
                  <td className="px-4 py-3">{flat.wing_name}</td>
                  <td className="px-4 py-3">Floor {flat.floor}</td>
                  <td className="px-4 py-3 font-mono">{flat.area_sqft} sq.ft</td>
                  <td className="px-4 py-3">
                    {flat.is_occupied ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Occupied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        <XCircle className="w-3 h-3" />
                        Vacant
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {flat.resident_name ? (
                      <div>
                        <span className="font-medium text-slate-900 block">{flat.resident_name}</span>
                        <span className="text-[10px] text-slate-400">{flat.resident_phone}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No resident assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Wing Modal */}
      {showAddWingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Add New Wing</h3>
            <form onSubmit={handleCreateWing} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Wing Name</label>
                <input
                  type="text"
                  placeholder="e.g. D Wing"
                  value={wingName}
                  onChange={(e) => setWingName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Floors</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddWingModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                >
                  Create Wing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Flat Modal */}
      {showAddFlatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Add Flat to Society</h3>
            <form onSubmit={handleCreateFlat} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Wing</label>
                  <select
                    value={flatWingId}
                    onChange={(e) => setFlatWingId(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    {wings.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Flat Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-301"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min={0}
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    min={100}
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_occupied"
                  checked={isOccupied}
                  onChange={(e) => setIsOccupied(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="is_occupied" className="text-xs text-slate-700">
                  Flat is already occupied
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFlatModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                >
                  Save Flat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
