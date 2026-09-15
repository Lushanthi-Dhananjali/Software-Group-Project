import React, { useState } from 'react';
import { PhysicsClass, PaymentSlip, User, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Search, Filter, BookOpen, UserCheck, Truck, FileText, DollarSign, MapPin, User as UserIcon, Phone, CheckCircle2, Clock, Eye } from 'lucide-react';

interface AdminClassesStudentsProps {
  classes: PhysicsClass[];
  slips: PaymentSlip[];
  users: User[];
  lang: Language;
}

export default function AdminClassesStudents({ classes, slips, users, lang }: AdminClassesStudentsProps) {
  const t = TRANSLATIONS[lang];
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOption, setFilterOption] = useState<'all' | 'delivery' | 'pdf' | 'pending'>('all');

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  if (!activeClass) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No classes configured in the database yet. Please publish a class first.
      </div>
    );
  }

  // Find all slips associated with this class
  const classSlips = slips.filter(s => s.classId === activeClass.id);

  // Filter students based on slips or manual enrollment
  // A student has paid if they have an approved slip
  const studentSlips = classSlips.map(slip => {
    const userProfile = users.find(u => u.id === slip.studentId);
    return {
      slipId: slip.id,
      studentId: slip.studentId,
      name: slip.studentName,
      indexNo: slip.indexNo,
      mobile: userProfile?.mobile || 'N/A',
      whatsapp: userProfile?.whatsapp || '',
      wantsPrintedMaterials: !!slip.wantsPrintedMaterials,
      postalAddress: slip.postalAddress || userProfile?.address || 'No address saved',
      status: slip.status,
      amountPaid: slip.amountPaid,
      uploadedAt: slip.uploadedAt
    };
  });

  // Filter lists based on search and filters
  const filteredStudents = studentSlips.filter(s => {
    // 1. Search filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(query) ||
      s.indexNo.toLowerCase().includes(query) ||
      s.mobile.toLowerCase().includes(query) ||
      s.postalAddress.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // 2. Filter tabs
    if (filterOption === 'delivery') return s.wantsPrintedMaterials && s.status === 'approved';
    if (filterOption === 'pdf') return !s.wantsPrintedMaterials && s.status === 'approved';
    if (filterOption === 'pending') return s.status === 'pending';
    return true; // 'all'
  });

  // Calculate high-level stats for the selected class
  const approvedSlips = classSlips.filter(s => s.status === 'approved');
  const pendingCount = classSlips.filter(s => s.status === 'pending').length;
  const deliveryCount = approvedSlips.filter(s => s.wantsPrintedMaterials).length;
  const pdfOnlyCount = approvedSlips.filter(s => !s.wantsPrintedMaterials).length;
  const totalRevenue = approvedSlips.reduce((sum, s) => sum + s.amountPaid, 0);

  return (
    <div id="admin-classes-students-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800 gap-4">
        <div>
          <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            Classes & Student Registry
          </h3>
          <p className="text-xs text-slate-400">
            Monitor tuition fee submissions, filter class enrollment, and identify students requesting physical booklet delivery.
          </p>
        </div>

        {/* Class Selector Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 shrink-0 font-medium">Select Class:</span>
          <select
            id="admin-classes-students-selector"
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSearchQuery('');
              setFilterOption('all');
            }}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 w-full md:w-64 cursor-pointer"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                [{cls.batch} Batch] {cls.name[lang]} ({cls.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Total Enrolled / Paid</span>
            <span className="text-lg font-mono font-bold text-slate-100">{approvedSlips.length} Students</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3.5">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Postal Deliveries</span>
            <span className="text-lg font-mono font-bold text-purple-400">{deliveryCount} Students</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Digital PDF Only</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{pdfOnlyCount} Students</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Reconciled Revenue</span>
            <span className="text-lg font-mono font-bold text-amber-400">LKR {totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filtering Controls & Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-950/20">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="admin-classes-students-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, index number, or address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-850 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Students' },
              { id: 'delivery', label: '📦 Postal Delivery' },
              { id: 'pdf', label: '💻 PDF Only' },
              { id: 'pending', label: '⏳ Pending Approval' }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setFilterOption(option.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterOption === option.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[10px] uppercase font-bold">
                <th className="p-4 sm:px-6">Student Information</th>
                <th className="p-4">Contact Detail</th>
                <th className="p-4">Delivery Choice & Post Address</th>
                <th className="p-4">Submission Status</th>
                <th className="p-4 text-right sm:pr-6">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-y-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                    No students match the selected filters or search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.slipId} className="hover:bg-slate-950/20 transition-colors">
                    <td className="p-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-950 rounded-lg text-slate-400 border border-slate-850">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs sm:text-sm">{student.name}</h4>
                          <span className="font-mono text-[10px] text-slate-500">Index: {student.indexNo}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 text-slate-300 font-mono">
                          <Phone className="h-3.5 w-3.5 text-slate-500" />
                          {student.mobile}
                        </p>
                        {student.whatsapp && (
                          <a 
                            href={`https://wa.me/${student.whatsapp.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 font-medium hover:underline flex items-center gap-1"
                          >
                            WhatsApp Link
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="p-4 max-w-sm">
                      {student.wantsPrintedMaterials ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border border-purple-500/20">
                            📦 Postal Delivery (Study Materials)
                          </span>
                          <p className="text-slate-300 font-sans text-xs bg-slate-950/50 p-2 rounded-lg border border-slate-850/80 leading-relaxed mt-1 flex gap-1.5 items-start">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{student.postalAddress}</span>
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border border-emerald-500/20">
                          💻 Digital PDF Only
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {student.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Reconciled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
                          <Clock className="h-3 w-3" /> Pending Audit
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">Paid on: {student.uploadedAt}</span>
                    </td>

                    <td className="p-4 text-right sm:pr-6 font-mono font-bold text-slate-100">
                      LKR {student.amountPaid.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
