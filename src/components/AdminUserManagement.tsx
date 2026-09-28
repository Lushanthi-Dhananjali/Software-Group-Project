import React, { useState } from 'react';
import { User, Language, Role, VerificationStatus, PhysicsClass } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Search, UserCheck, Shield, Trash, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AdminUserManagementProps {
  users: User[];
  currentUser?: User;
  lang: Language;
  onUpdateUserStatus: (userId: string, status: VerificationStatus) => void;
  onUpdateUserRole: (userId: string, role: Role) => void;
  onDeleteUser: (userId: string) => void;
  classes: PhysicsClass[];
  onUpdateManuallyEnrolledClasses?: (userId: string, classIds: string[]) => void;
}

export default function AdminUserManagement({
  users, currentUser, lang, onUpdateUserStatus, onUpdateUserRole, onDeleteUser, classes, onUpdateManuallyEnrolledClasses
}: AdminUserManagementProps) {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter((u) => {
    // Only Super Admin can access all accounts (students and admins). Other roles see only students.
    const isVisible = currentUser?.role === 'super-admin' || u.role === 'student';
    if (!isVisible) return false;

    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.indexNo.toLowerCase().includes(search.toLowerCase()) ||
                          u.mobile.toLowerCase().includes(search.toLowerCase()) ||
                          (u.school && u.school.toLowerCase().includes(search.toLowerCase())) ||
                          (u.district && u.district.toLowerCase().includes(search.toLowerCase())) ||
                          (u.address && u.address.toLowerCase().includes(search.toLowerCase())) ||
                          (u.whatsapp && u.whatsapp.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-user-directory" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            {t.userDirectory}
          </h3>
          <p className="text-xs text-slate-400">
            Search, modify index registers, alter class clearances, and configure authorization roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status filter:</span>
          <select
            id="admin-user-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Registrants</option>
            <option value="active">Verified Only</option>
            <option value="pending">Pending Verification</option>
            <option value="rejected">Rejected Accounts</option>
          </select>
        </div>
      </div>

      {/* Security Clearance Indicator */}
      {currentUser?.role === 'super-admin' ? (
        <div className="bg-amber-500/15 border border-amber-500/20 text-amber-300 rounded-xl p-3.5 text-xs flex items-center gap-2 font-mono">
          <ShieldAlert className="h-4 w-4 animate-pulse shrink-0 text-amber-500" />
          <span>⚡ Level-5 Super Admin clearance active: displaying student, editor, instructor, and staff admin accounts.</span>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-850 text-slate-400 rounded-xl p-3.5 text-xs flex items-center gap-2 font-mono">
          <Shield className="h-4 w-4 shrink-0 text-slate-500" />
          <span>🔒 Standard staff view active: showing student registers only. Admin, instructor, and system logs are isolated.</span>
        </div>
      )}

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
        <input
          id="admin-user-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Desktop Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <th className="p-4">Student Info & Index</th>
              <th className="p-4">Contact Coordinates</th>
              <th className="p-4">Batch Target</th>
              <th className="p-4">Manual Class Access</th>
              <th className="p-4">Verification Clearance</th>
              <th className="p-4">System Role</th>
              <th className="p-4 text-center">Admin Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">No registered accounts match your query criteria.</td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white text-sm">{u.name}</div>
                    <div className="font-mono text-[10px] text-amber-500 font-bold mt-0.5">{u.indexNo}</div>
                    {(u.gender || u.school) && (
                      <div className="text-[10px] text-amber-200/80 mt-0.5 font-medium">
                        {u.gender && <span>{u.gender}</span>}
                        {u.gender && u.school && <span> • </span>}
                        {u.school && <span>{u.school}</span>}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500">ID: {u.id}</div>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="truncate max-w-[180px]">{u.email}</div>
                    <div className="flex flex-col gap-0.5 text-[11px] text-slate-400 font-mono">
                      <div>Mobile: {u.mobile}</div>
                      {u.whatsapp && <div className="text-emerald-400">WhatsApp: {u.whatsapp}</div>}
                    </div>
                    {u.address && (
                      <div className="text-[10px] text-slate-400 border-t border-slate-800/50 pt-1 mt-1 max-w-[240px] whitespace-pre-wrap font-sans" title={u.address}>
                        <span className="font-bold text-slate-500">Addr:</span> {u.address}
                      </div>
                    )}
                  </td>
                  <td className="p-4 space-y-1">
                    <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-200 block w-fit">
                      {u.batch} Theory
                    </span>
                    {u.district && (
                      <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 block w-fit mt-1">
                        📍 {u.district}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.role !== 'student' ? (
                      <span className="text-slate-500 italic text-[10px]">N/A (Staff)</span>
                    ) : (
                      <div className="space-y-2 max-w-[200px]">
                        {/* Currently manually enrolled classes */}
                        <div className="flex flex-wrap gap-1">
                          {(u.manuallyEnrolledClasses || []).length === 0 ? (
                            <span className="text-[10px] text-slate-500 italic">No manual enrollment</span>
                          ) : (
                            (u.manuallyEnrolledClasses || []).map((classId) => {
                              const cls = classes.find(c => c.id === classId);
                              if (!cls) return null;
                              return (
                                <span
                                  key={classId}
                                  className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 text-[10px] font-medium text-slate-300 px-2 py-0.5 rounded-lg"
                                >
                                  <span className="truncate max-w-[100px]" title={cls.name[lang]}>
                                    {cls.name[lang]}
                                  </span>
                                  {currentUser?.role === 'super-admin' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextClasses = (u.manuallyEnrolledClasses || []).filter(id => id !== classId);
                                        onUpdateManuallyEnrolledClasses?.(u.id, nextClasses);
                                      }}
                                      className="text-red-400 hover:text-red-300 font-bold ml-0.5 focus:outline-none"
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              );
                            })
                          )}
                        </div>

                        {/* Super Admin selection controls */}
                        {currentUser?.role === 'super-admin' && (
                          <div className="mt-1">
                            {(() => {
                              const availableClasses = classes.filter(
                                c => !(u.manuallyEnrolledClasses || []).includes(c.id)
                              );
                              if (availableClasses.length === 0) return null;
                              return (
                                <select
                                  id={`enroll-select-${u.id}`}
                                  value=""
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                      const nextClasses = [...(u.manuallyEnrolledClasses || []), val];
                                      onUpdateManuallyEnrolledClasses?.(u.id, nextClasses);
                                    }
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 text-[10px] rounded-lg px-2 py-1 text-slate-400 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                                >
                                  <option value="">+ Enroll Class...</option>
                                  {availableClasses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      [{c.batch}] {c.name[lang]}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {u.status === 'active' && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" /> {t.activeBadge}
                      </span>
                    )}
                    {u.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400 border border-yellow-500/20">
                        <Clock className="h-3 w-3" /> {t.pendingBadge}
                      </span>
                    )}
                    {u.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                        <AlertTriangle className="h-3 w-3" /> {t.rejectedBadge}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.email === 'admin@channelaplus.com' ? (
                      <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                        Super Admin (Permanent)
                      </span>
                    ) : currentUser?.role === 'super-admin' ? (
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateUserRole(u.id, e.target.value as Role)}
                        className="bg-slate-950 border border-slate-800 text-[11px] rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500/50 uppercase font-mono font-bold cursor-pointer"
                      >
                        <option value="student">STUDENT</option>
                        <option value="instructor">INSTRUCTOR</option>
                        <option value="editor">EDITOR</option>
                        <option value="admin">ADMINStaff</option>
                        <option value="super-admin">SUPER ADMIN</option>
                      </select>
                    ) : (
                      <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-400 uppercase font-mono">
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2.5 justify-center items-center">
                      {/* Toggle status action (only if not permanent super admin) */}
                      {u.email !== 'admin@channelaplus.com' ? (
                        <button
                          title="Toggle verification status"
                          onClick={() => onUpdateUserStatus(u.id, u.status === 'active' ? 'pending' : 'active')}
                          className={`p-1.5 rounded-lg border transition-all hover:scale-105 ${
                            u.status === 'active'
                              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-500 cursor-not-allowed text-[10px] font-bold uppercase font-mono">
                          Locked
                        </span>
                      )}

                      {/* Delete student profile (only if not permanent super admin) */}
                      {u.email !== 'admin@channelaplus.com' && (
                        <button
                          title="Erase profile"
                          onClick={() => {
                            if (confirm(`Are you absolutely sure you want to permanently delete user profile [${u.name}]?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all hover:scale-105"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
