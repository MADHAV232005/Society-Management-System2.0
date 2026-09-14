import React, { useState } from 'react';
import {
  Building2,
  Bell,
  Shield,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut,
  LogIn,
} from 'lucide-react';
import { User, UserRole, Notification } from '../types';

interface NavbarProps {
  societyName: string;
  currentUser: User | null;
  notifications: Notification[];
  onResetData: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  societyName,
  currentUser,
  notifications,
  onResetData,
  onOpenLogin,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMMITTEE':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'SECURITY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'RESIDENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'COMMITTEE':
        return 'Committee Member';
      case 'SECURITY':
        return 'Security Guard';
      case 'RESIDENT':
        return 'Resident';
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Society */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 text-base leading-tight">
                  {societyName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Society Management & ERP Portal
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Active User and Role Badge */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[11px]">
                    {currentUser.first_name ? currentUser.first_name[0] : currentUser.username[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-slate-800 leading-none">
                        {currentUser.first_name} {currentUser.last_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(
                          currentUser.role
                        )}`}
                      >
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>
                    {currentUser.role === 'RESIDENT' && currentUser.resident_profile && (
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                        Flat {currentUser.resident_profile.flat_number} • {currentUser.resident_profile.wing_name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-2 py-1 text-xs text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  title="Switch account"
                >
                  Switch Account
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                  title="Sign out (clears JWT tokens)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-semibold text-white hover:bg-sky-700 shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Recent Alerts
                    </span>
                    <span className="text-xs text-slate-400">
                      {notifications.length} alerts
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start space-x-2.5">
                          {n.type === 'ALERT' && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'SUCCESS' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'INFO' && (
                            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {n.created_at}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              type="button"
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:inline-flex"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Current User Pill */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 hover:bg-slate-50 p-1.5 rounded-lg transition-colors text-left"
              title="Click to authenticate or switch user"
            >
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-medium text-xs">
                {currentUser.first_name ? currentUser.first_name[0] : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-slate-900 leading-tight">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <span
                  className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadge(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
