import React, { useState } from 'react';
import { PaymentSlip, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Check, X, ClipboardCheck, Clock, ExternalLink, ShieldCheck, UserMinus, AlertCircle } from 'lucide-react';

interface AdminSlipVerificationProps {
  slips: PaymentSlip[];
  lang: Language;
  onVerifySlip: (slipId: string, status: 'approved' | 'rejected', comments?: string) => void;
}

export default function AdminSlipVerification({ slips, lang, onVerifySlip }: AdminSlipVerificationProps) {
  const t = TRANSLATIONS[lang];
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const pendingSlips = slips.filter(s => s.status === 'pending');

  const handleAction = (status: 'approved' | 'rejected') => {
    if (!selectedSlip) return;
    if (status === 'rejected' && !feedback.trim()) {
      alert("Please provide a rejection reason in the feedback input field first.");
      return;
    }

    onVerifySlip(selectedSlip.id, status, status === 'rejected' ? feedback : undefined);
    setSelectedSlip(null);
    setFeedback('');
  };

  return (
    <div id="admin-slip-verification-bureau" className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-400" />
            {t.slipVerificationBureau}
          </h3>
          <p className="text-xs text-slate-400">
            Verify deposited cash receipts and physically scanned bank slips to instantly unlock class modules.
          </p>
        </div>
        <span className="bg-amber-500/10 text-amber-400 font-mono text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
          Pending Receipts: {pendingSlips.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Slips list queue */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl h-[450px] overflow-y-auto">
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block mb-3">
            Active Verification Queue
          </span>

          <div className="space-y-2.5">
            {pendingSlips.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs italic">
                No pending bank slips in queue. All payments reconciled!
              </div>
            ) : (
              pendingSlips.map((slip) => (
                <button
                  key={slip.id}
                  onClick={() => { setSelectedSlip(slip); setFeedback(''); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center gap-4 ${
                    selectedSlip?.id === slip.id
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-slate-500 block">{slip.month}</span>
                    <h4 className="font-sans font-bold text-xs truncate leading-tight">
                      {slip.studentName}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      Index: {slip.indexNo} • {slip.batch}
                    </p>
                    <span className="text-[10px] font-mono text-amber-500 font-semibold mt-1.5 block">
                      LKR {slip.amountPaid}
                    </span>
                  </div>

                  <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                    <img
                      src={slip.slipImageUrl}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Side-by-side workspace */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[450px]">
          {selectedSlip ? (
            <div className="space-y-6 h-full flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left metadata */}
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-3.5 text-xs">
                    <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-bold block">
                      Student Credentials
                    </span>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Name</p>
                      <p className="font-bold text-slate-200 text-sm truncate">{selectedSlip.studentName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Student Index & Batch</p>
                      <p className="font-mono font-bold text-slate-200">{selectedSlip.indexNo} ({selectedSlip.batch} Batch)</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Class Pathway</p>
                      <p className="font-semibold text-slate-200">{selectedSlip.className[lang]}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Amount Submitted & Month</p>
                      <p className="font-mono font-bold text-emerald-400">LKR {selectedSlip.amountPaid} for {selectedSlip.month}</p>
                    </div>
                    {selectedSlip.wantsPrintedMaterials && (
                      <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-slate-355 space-y-1">
                        <p className="text-purple-400 font-bold text-[9px] uppercase tracking-wider">
                          📦 Printed Materials requested
                        </p>
                        <p className="font-sans text-[11px] text-slate-200 leading-relaxed">
                          Address: <span className="text-white font-medium">{selectedSlip.postalAddress}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                      Tutor Comment / Rejection Reason
                    </label>
                    <textarea
                      id="slip-feedback-textarea"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="e.g. Please upload a high-resolution, unblurred photograph. Missing bank stamp."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 min-h-[80px]"
                    />
                    <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                      This feedback is shown instantly on the student dashboard if transaction is rejected.
                    </p>
                  </div>
                </div>

                {/* Right image view */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">High-Res Receipt</span>
                    <a
                      href={selectedSlip.slipImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Maximize <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-slate-800 aspect-[3/4] max-h-64">
                    <img
                      src={selectedSlip.slipImageUrl}
                      alt="Deposit bank slip receipt copy"
                      className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Approval controls */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleAction('rejected')}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  {t.rejectBtn}
                </button>
                <button
                  onClick={() => handleAction('approved')}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15"
                >
                  <Check className="h-4 w-4" />
                  {t.approveBtn}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 max-w-sm mx-auto h-full">
              <ClipboardCheck className="h-12 w-12 text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">
                Select a Bank Slip for Verification
              </h4>
              <p className="text-xs">
                Pick a student transaction from the active verification queue on the left to initiate review, check details, and approve instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
