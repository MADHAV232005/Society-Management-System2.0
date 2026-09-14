import React, { useState } from 'react';
import { TrendingDown, Plus, Receipt, DollarSign, Calendar } from 'lucide-react';
import { Expense } from '../../types';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (data: Omit<Expense, 'id' | 'date'>) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [category, setCategory] = useState<Expense['category']>('MAINTENANCE');
  const [paidTo, setPaidTo] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [approvedBy, setApprovedBy] = useState('Committee President');
  const [notes, setNotes] = useState('');

  const totalExpenditure = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;
    onAddExpense({
      title: title.trim(),
      description: notes.trim() || 'Society Expense',
      amount,
      category,
      vendor_name: paidTo.trim() || 'Vendor',
      invoice_number: receiptNo.trim() || `VOUCH-${Date.now().toString().slice(-6)}`,
      expense_date: new Date().toISOString().split('T')[0],
      paid_to: paidTo.trim() || 'Vendor',
      receipt_no: receiptNo.trim() || `VOUCH-${Date.now().toString().slice(-6)}`,
      approved_by: approvedBy.trim(),
      notes: notes.trim() || undefined,
      is_active: true,
    });
    setTitle('');
    setPaidTo('');
    setReceiptNo('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Expenses & Society Accounts</h2>
          <p className="text-xs text-slate-500">
            Common utility bills, security agency payouts, repairs, and vendor vouchers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Outflow</span>
            <span className="text-base font-bold text-slate-900">₹{totalExpenditure.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Voucher / Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Paid To</th>
                <th className="px-4 py-3">Amount (₹)</th>
                <th className="px-4 py-3">Approved By</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 block">{e.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{e.receipt_no || e.invoice_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{e.paid_to || e.vendor_name}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{Number(e.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.approved_by || e.recorded_by_name || 'Committee'}</td>
                  <td className="px-4 py-3 text-slate-500">{e.date || e.expense_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Log Society Expenditure</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Common Area Lighting Overhaul"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Expense['category'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="SECURITY">Security</option>
                    <option value="UTILITY">Electricity / Water</option>
                    <option value="SALARY">Staff Salary</option>
                    <option value="REPAIR">Repairs</option>
                    <option value="GARDENING">Gardening</option>
                    <option value="EVENT">Event / Festival</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vendor / Paid To</label>
                  <input
                    type="text"
                    placeholder="e.g. MSEDCL, CleanPro"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Voucher / Invoice No</label>
                  <input
                    type="text"
                    placeholder="INV-2026-09"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Approved By</label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
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
                  className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                >
                  Save Expenditure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
