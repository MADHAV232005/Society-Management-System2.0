import React, { useState } from 'react';
import { FileText, Plus, Download, Folder, Calendar, User } from 'lucide-react';
import { Document } from '../../types';

interface DocumentsViewProps {
  documents: Document[];
  onAddDocument: (data: Omit<Document, 'id' | 'created_at'>) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onAddDocument,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Document['category']>('BYLAWS');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [uploadedBy, setUploadedBy] = useState('Society Secretary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddDocument({
      title: title.trim(),
      description: `${category} - ${fileName.trim() || 'Document'}`,
      category,
      file_name: fileName.trim() || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      file_size: fileSize,
      uploaded_by: uploadedBy.trim(),
      is_active: true,
    });
    setTitle('');
    setFileName('');
    setShowAddModal(false);
  };

  const handleSimulateDownload = (doc: Document) => {
    // Download document details
    const fileName = doc.file_name || `${doc.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    const blob = new Blob(
      [
        `Document: ${doc.title}\nCategory: ${doc.category || 'Official'}\nFile: ${fileName}\nUploaded By: ${doc.uploaded_by_name || 'Society Office'}\nDate: ${doc.created_at}\n\nGreen Valley Cooperative Housing Society Official Record.`
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Documents & Bylaws</h2>
          <p className="text-xs text-slate-500">
            Official society bylaws, statutory audit statements, and general meeting minutes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-shadow"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-medium text-slate-600">
                    {doc.category || 'Official'}
                  </span>
                  <span>{doc.file_size || 'Document'}</span>
                  <span>• {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  By {doc.uploaded_by_name || 'Secretary'} • {doc.file_name || doc.title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSimulateDownload(doc)}
              className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors shrink-0 ml-2"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Upload Society Document</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lift Modernization Tender 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Document['category'])}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="BYLAWS">Society Bye-Laws</option>
                    <option value="AUDIT_REPORT">Audit Report</option>
                    <option value="MEETING_MINUTES">Meeting Minutes</option>
                    <option value="VENDOR_CONTRACT">Vendor Contract</option>
                    <option value="POLICY">Policy & Circular</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">File Name</label>
                  <input
                    type="text"
                    placeholder="document.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono"
                    required
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
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
