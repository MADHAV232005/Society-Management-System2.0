import React, { useState } from 'react';
import { Code2, Play, CheckCircle, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import {
  Society,
  Wing,
  Flat,
  Resident,
  MaintenanceBill,
  Payment,
  Complaint,
  Visitor,
  Notice,
  Staff,
  Expense,
  Document,
  AuditLog,
} from '../../types';

interface ApiExplorerViewProps {
  society: Society;
  wings: Wing[];
  flats: Flat[];
  residents: Resident[];
  bills: MaintenanceBill[];
  payments: Payment[];
  complaints: Complaint[];
  visitors: Visitor[];
  notices: Notice[];
  staff: Staff[];
  expenses: Expense[];
  documents: Document[];
  auditLogs: AuditLog[];
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({
  society,
  wings,
  flats,
  residents,
  bills,
  payments,
  complaints,
  visitors,
  notices,
  staff,
  expenses,
  documents,
  auditLogs,
}) => {
  const endpoints = [
    { path: '/api/societies/', method: 'GET', name: 'Society Details', data: [society] },
    { path: '/api/wings/', method: 'GET', name: 'Wings List', data: wings },
    { path: '/api/flats/', method: 'GET', name: 'Flats & Units', data: flats },
    { path: '/api/residents/', method: 'GET', name: 'Residents Profile', data: residents },
    { path: '/api/maintenance-bills/', method: 'GET', name: 'Maintenance Invoices', data: bills },
    { path: '/api/payments/', method: 'GET', name: 'Payments Register', data: payments },
    { path: '/api/complaints/', method: 'GET', name: 'Complaints & Grievances', data: complaints },
    { path: '/api/visitors/', method: 'GET', name: 'Visitor Gate Pass Log', data: visitors },
    { path: '/api/notices/', method: 'GET', name: 'Notices & Circulars', data: notices },
    { path: '/api/staff/', method: 'GET', name: 'Staff & Security Personnel', data: staff },
    { path: '/api/expenses/', method: 'GET', name: 'Society Expenses & Vouchers', data: expenses },
    { path: '/api/documents/', method: 'GET', name: 'Documents & Bylaws', data: documents },
    { path: '/api/audit-logs/', method: 'GET', name: 'Audit Logs', data: auditLogs },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [copied, setCopied] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number>(200);
  const [responseTime, setResponseTime] = useState<number>(14);

  const handleTestEndpoint = (ep: typeof endpoints[0]) => {
    setSelectedEndpoint(ep);
    setResponseStatus(200);
    setResponseTime(Math.floor(10 + Math.random() * 25));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedEndpoint.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Django REST Framework (DRF) API Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Inspect and query the REST endpoints declared in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">config/urls.py</code> with real-time dataset serialization.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
            Available Endpoints ({endpoints.length})
          </span>
          <div className="space-y-0.5">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path;
              return (
                <button
                  key={ep.path}
                  type="button"
                  onClick={() => handleTestEndpoint(ep)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      {ep.method}
                    </span>
                    <span className="truncate">{ep.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {Array.isArray(ep.data) ? ep.data.length : 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live response window */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-xl shadow-md overflow-hidden flex flex-col font-mono text-xs border border-slate-800">
          {/* Top terminal bar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 text-[11px] ml-2 font-sans font-medium">
                {selectedEndpoint.name}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                HTTP {responseStatus} OK
              </span>
              <span className="text-slate-400 text-[10px]">{responseTime}ms</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy JSON response"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Request url banner */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">{selectedEndpoint.method}</span>
              <span className="text-slate-200">{selectedEndpoint.path}</span>
            </div>
            <span className="text-[10px] text-slate-500">Content-Type: application/json</span>
          </div>

          {/* Response Payload */}
          <div className="p-4 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed text-sky-300">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(selectedEndpoint.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
