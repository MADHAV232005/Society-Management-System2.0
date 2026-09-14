import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { MaintenanceBill, Payment, Flat, UserRole, User } from '../../types';

interface BillingViewProps {
  bills: MaintenanceBill[];
  payments: Payment[];
  flats: Flat[];
  onCreateBill: (bill: Omit<MaintenanceBill, 'id' | 'created_at' | 'total_paid' | 'pending_amount' | 'status'>) => void;
  onRecordPayment: (
    billId: number,
    amount: number,
    method: Payment['payment_method'],
    transactionId: string
  ) => void;
  userRole?: UserRole;
  currentUser?: User | null;
}

export const BillingView: React.FC<BillingViewProps> = ({
  bills,
  payments,
  flats,
  onCreateBill,
  onRecordPayment,
  userRole = 'SUPER_ADMIN',
  currentUser,
}) => {
  const isResident = userRole === 'RESIDENT';
  const canManageBills = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';

  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'payments'>('bills');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<MaintenanceBill | null>(null);

  // New bill state
  const [selectedFlatId, setSelectedFlatId] = useState<number>(flats[0]?.id || 1);
  const [billingMonth, setBillingMonth] = useState('October 2026');
  const [dueDate, setDueDate] = useState('2026-10-20');
  const [billAmount, setBillAmount] = useState(3850);
  const [billDesc, setBillDesc] = useState('Monthly Maintenance + Sinking Fund + Water');

  // Payment modal state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('UPI');
  const [txnId, setTxnId] = useState('');

  const totalBilled = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.reduce((acc, b) => acc + b.total_paid, 0);
  const totalPending = bills.reduce((acc, b) => acc + b.pending_amount, 0);

  const filteredBills = statusFilter === 'ALL'
    ? bills
    : bills.filter((b) => b.status === statusFilter);

  const handleOpenPayment = (bill: MaintenanceBill) => {
    setSelectedBillForPayment(bill);
    setPaymentAmount(bill.pending_amount);
    setTxnId(`UPI-${Date.now().toString().slice(-8)}`);
    setShowPaymentModal(true);
  };

  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const flat = flats.find((f) => f.id === Number(selectedFlatId)) || flats[0];
    onCreateBill({
      flat: flat ? flat.id : 1,
      flat_id: flat ? flat.id : 1,
      flat_number: flat?.flat_number || '',
      wing_name: flat?.wing_name || '',
      billing_month: billingMonth,
      due_date: dueDate,
      amount: billAmount,
      description: billDesc,
    });
    setShowCreateBillModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment || paymentAmount <= 0) return;
    onRecordPayment(
      selectedBillForPayment.id,
      paymentAmount,
      paymentMethod,
      txnId
    );
    setShowPaymentModal(false);
    setSelectedBillForPayment(null);
  };

  const getStatusBadge = (status: MaintenanceBill['status']) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PARTIAL':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            {isResident ? 'My Invoiced Dues' : 'Total Billed'}
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">₹{totalBilled.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">
            {isResident ? `${bills.length} bills issued to your flat` : `${bills.length} invoices generated`}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-emerald-700">
            {isResident ? 'My Total Paid' : 'Total Collected'}
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1">₹{totalPaid.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 font-medium">
            {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}% settled
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-amber-700">
            {isResident ? 'My Outstanding Dues' : 'Pending Receivables'}
          </span>
          <p className="text-xl font-bold text-amber-600 mt-1">₹{totalPending.toLocaleString()}</p>
          <span className="text-[10px] text-amber-700 font-medium">
            {isResident ? (totalPending > 0 ? 'Payment due soon' : 'All clear') : 'Due from residents'}
          </span>
        </div>
      </div>

      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('bills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'bills'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isResident ? 'My Maintenance Invoices' : 'Maintenance Bills'} ({bills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('payments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'payments'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payment Receipts ({payments.length})
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {activeSubTab === 'bills' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          )}

          {canManageBills && (
            <button
              type="button"
              onClick={() => setShowCreateBillModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Bill</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-view 1: Bills Table */}
      {activeSubTab === 'bills' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Flat & Wing</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Bill Amount</th>
                  <th className="px-4 py-3">Paid / Pending</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {bill.flat_number}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {bill.wing_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {bill.billing_month}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{bill.due_date}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₹{bill.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-700 font-medium">
                        ₹{bill.total_paid.toLocaleString()}
                      </span>{' '}
                      /{' '}
                      <span className="text-amber-700 font-medium">
                        ₹{bill.pending_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                          bill.status
                        )}`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {bill.pending_amount > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(bill)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-2xs"
                        >
                          {isResident ? 'Pay Online' : 'Record Payment'}
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-xs font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-view 2: Payments / Receipts Table */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Receipt / Txn ID</th>
                  <th className="px-4 py-3">Flat</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Paid By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {p.transaction_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      Flat {p.flat_number}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-700">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.paid_by}</td>
                    <td className="px-4 py-3 text-slate-500">{p.payment_date}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showCreateBillModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Generate Maintenance Bill</h3>
            <form onSubmit={handleCreateBillSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Flat</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Billing Month</label>
                  <input
                    type="text"
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description / Line Items</label>
                <textarea
                  value={billDesc}
                  onChange={(e) => setBillDesc(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateBillModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedBillForPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {isResident ? 'Pay Maintenance Dues' : 'Record Maintenance Payment'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Flat {selectedBillForPayment.flat_number} • {selectedBillForPayment.billing_month}
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Amount (₹) (Max ₹{selectedBillForPayment.pending_amount})
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedBillForPayment.pending_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['payment_method'])}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="NET_BANKING">Net Banking (NEFT/IMPS)</option>
                  <option value="CASH">Cash at Society Office</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Ref / Cheque No</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
