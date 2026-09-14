import React, { useState } from 'react';
import { Megaphone, Plus, Pin, Trash2, Calendar, User } from 'lucide-react';
import { Notice, UserRole } from '../../types';

interface NoticesViewProps {
  notices: Notice[];
  onAddNotice: (data: {
    title: string;
    content: string;
    priority: Notice['priority'];
    is_pinned: boolean;
  }) => void;
  onDeleteNotice: (id: number) => void;
  userRole?: UserRole;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  notices,
  onAddNotice,
  onDeleteNotice,
  userRole = 'SUPER_ADMIN',
}) => {
  const canManageNotices = userRole === 'SUPER_ADMIN' || userRole === 'COMMITTEE';
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Notice['priority']>('MEDIUM');
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddNotice({
      title: title.trim(),
      content: content.trim(),
      priority,
      is_pinned: isPinned,
    });
    setTitle('');
    setContent('');
    setIsPinned(false);
    setShowAddModal(false);
  };

  const getPriorityStyle = (priority: Notice['priority']) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Notices & Circulars</h2>
          <p className="text-xs text-slate-500">
            Official announcements, maintenance schedules, and AGM notices
          </p>
        </div>
        {canManageNotices && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-medium text-white hover:bg-sky-700 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-xl border p-5 transition-shadow shadow-2xs flex flex-col justify-between ${
              n.is_pinned ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {n.is_pinned && (
                    <span className="p-1 rounded bg-amber-100 text-amber-800" title="Pinned Announcement">
                      <Pin className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(
                      n.priority
                    )}`}
                  >
                    {n.priority}
                  </span>
                </div>
                {canManageNotices && (
                  <button
                    type="button"
                    onClick={() => onDeleteNotice(n.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2">{n.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {n.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {n.author || n.published_by_name || 'Society Office'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Publish New Circular</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g. Water Tank Maintenance Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Notice['priority'])}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="NORMAL">Normal / General Info</option>
                  <option value="MEDIUM">Medium / Upcoming Event</option>
                  <option value="HIGH">High / Important Notice</option>
                  <option value="URGENT">Urgent / Action Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  placeholder="Details of the announcement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pin_notice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="pin_notice" className="text-xs text-slate-700">
                  Pin to top of Dashboard
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
