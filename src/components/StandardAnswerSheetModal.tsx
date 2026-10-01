import React from 'react';
import { X, Download, Info, FileDown } from 'lucide-react';
import { Assignment } from '../types';

interface StandardAnswerSheetModalProps {
  assignment: Assignment;
  onClose: () => void;
}

export default function StandardAnswerSheetModal({ assignment, onClose }: StandardAnswerSheetModalProps) {
  const totalQuestions = assignment.totalQuestions || 30;
  const is20Questions = totalQuestions === 20;
  const imageSrc = '/templete_marking.png';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl animate-fade-in my-auto overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              Answer Sheet Template
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              ({totalQuestions} MCQs • {assignment.subject || 'Physics'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Image Button */}
            <a
              href={imageSrc}
              download="Physics_MCQ_Answer_Sheet_Template.png"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              title="Download image to phone or computer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Image</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950">
          {/* Instructions Banner */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-white">
                  Standard Template for both 20 and 30 MCQ Assignments:
                </p>
                <p className="text-[11px] text-slate-400">
                  {is20Questions ? (
                    <>
                      This assignment has <span className="font-bold text-amber-400">20 MCQs</span>. Fill only <strong>Questions 01 to 20</strong> (Columns 1 & 2). Questions left blank receive <strong>0 marks</strong>.
                    </>
                  ) : (
                    <>
                      This assignment has <span className="font-bold text-amber-400">30 MCQs</span>. Fill all <strong>Questions 01 to 30</strong> across all 3 columns. Questions left blank receive <strong>0 marks</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>

            <a
              href={imageSrc}
              download="Physics_MCQ_Answer_Sheet_Template.png"
              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-[11px] rounded-lg border border-amber-500/30 flex items-center gap-1.5 shrink-0 self-end sm:self-center transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Download (.png)
            </a>
          </div>

          {/* Template Image Display Box */}
          <div className="rounded-xl border border-slate-800 bg-white p-3 sm:p-5 flex flex-col items-center justify-center shadow-inner">
            <img
              src={imageSrc}
              alt="Standardized MCQ Answer Sheet Template (Questions 01 - 30)"
              className="max-h-[62vh] sm:max-h-[68vh] w-auto max-w-full object-contain mx-auto select-none"
            />
          </div>

          {/* Note Below Image */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500 px-1">
            <span>
              Fill chosen bubbles with dark black or blue pen (<span className="text-amber-400 font-bold">●</span>). Unanswered or unclear marks receive 0 marks.
            </span>
            <span>
              Target: {totalQuestions} Questions • Max: {totalQuestions} Marks
            </span>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <p className="text-xs text-slate-400 font-mono hidden sm:inline">
            Download this template image to draw and shade your answers clearly.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={imageSrc}
              download="Physics_MCQ_Answer_Sheet_Template.png"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Image</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
