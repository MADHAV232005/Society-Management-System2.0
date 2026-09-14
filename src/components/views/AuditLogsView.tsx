import React, { useState } from 'react';
import { History, Shield, Filter, Clock, User } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = actionFilter === 'ALL'
    ? auditLogs
    : auditLogs.filter((l) => l.action === actionFilter);

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'PAYMENT_RECEIVED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VISITOR_CHECKIN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Audit Trail & System Logs</h2>
          <p className="text-xs text-slate-500">
            Immutable log of all administrative actions, payments, gate check-ins, and model mutations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Actions ({auditLogs.length})</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="PAYMENT_RECEIVED">PAYMENT_RECEIVED</option>
            <option value="VISITOR_CHECKIN">VISITOR_CHECKIN</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Model Target</th>
                <th className="px-4 py-3">Audit Details</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block font-sans font-semibold text-[10px] px-2 py-0.5 rounded border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {log.model_name}
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-slate-700">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-900 font-medium">
                    {log.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
