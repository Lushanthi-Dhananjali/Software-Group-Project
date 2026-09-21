import React from 'react';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { ShieldCheck, Clock, AlertTriangle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface StudentDigitalIDProps {
  user: User;
  lang: Language;
}

export default function StudentDigitalID({ user, lang }: StudentDigitalIDProps) {
  const t = TRANSLATIONS[lang];
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    const qrContent = `Name: ${user.name}
Index: ${user.indexNo}
Batch: ${user.batch} Theory
Address: ${user.address || 'Not Provided'}`;

    QRCode.toDataURL(qrContent, {
      width: 350,
      margin: 2,
      color: {
        dark: '#0f172a',  // deep slate/black
        light: '#ffffff', // crisp white background
      },
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code', err);
      });
  }, [user]);

  return (
    <div id="student-digital-id" className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl ambient-glow max-w-md mx-auto">
      {/* Decorative Brand watermark background */}
      <div className="absolute -right-12 -bottom-12 font-display text-9xl font-extrabold text-amber-500/5 select-none pointer-events-none">
        A+
      </div>

      <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-display font-bold tracking-tight text-white text-lg">
            {t.appName}
          </h3>
          <p className="font-sans text-[10px] tracking-wider text-amber-500 uppercase font-semibold">
            {t.tagline}
          </p>
        </div>
        <div>
          {user.status === 'active' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.activeBadge}
            </span>
          )}
          {user.status === 'pending' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400 border border-yellow-500/20 animate-pulse">
              <Clock className="h-3.5 w-3.5" />
              {t.pendingBadge}
            </span>
          )}
          {user.status === 'rejected' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t.rejectedBadge}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-start mb-6">
        {/* Mock Avatar with initial letter */}
        <div className="h-16 w-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-inner text-amber-400">
          {user.name.charAt(0)}
        </div>

        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {t.fullName}
          </p>
          <h4 className="font-sans font-bold text-white text-base truncate">
            {user.name}
          </h4>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {t.indexNumber}
              </p>
              <span className="font-mono text-xs font-bold text-amber-400">
                {user.indexNo}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                A/L Batch
              </p>
              <span className="font-sans text-xs font-bold text-slate-200">
                {user.batch} Theory
              </span>
            </div>
          </div>

          <div className="mt-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              {lang === 'en' ? 'Postal Address' : 'තැපැල් ලිපිනය'}
            </p>
            <span className="font-sans text-xs text-slate-300 block line-clamp-2 mt-0.5">
              {user.address || (lang === 'en' ? 'Not Provided' : 'ලබා දී නැත')}
            </span>
          </div>
        </div>
      </div>

      {/* Retro scan QR code panel */}
      <div className="border-t border-slate-800 pt-4 flex flex-col items-center">
        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-3">
          {lang === 'en' ? 'VIRTUAL SCANNER ATTENDANCE QR CODE' : 'පැමිණීමේ සලකුණු කිරීමේ QR කේතය'}
        </p>
        <div className="bg-white p-3.5 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center">
          {qrCodeUrl ? (
            <img 
              id="attendance-qr-image"
              src={qrCodeUrl} 
              alt="Attendance QR Code" 
              className="w-40 h-40 rounded"
            />
          ) : (
            <div className="w-40 h-40 bg-slate-950 flex items-center justify-center text-slate-500 rounded text-[10px] font-mono">
              GENERATING QR...
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (qrCodeUrl) {
              const link = document.createElement('a');
              link.href = qrCodeUrl;
              link.download = `${user.indexNo}_attendance_qr.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          disabled={!qrCodeUrl}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer w-full justify-center shadow-md active:scale-95"
        >
          <QrCode className="h-4 w-4" />
          {lang === 'en' ? 'Download QR Code' : 'QR කේතය බාගත කරන්න'}
        </button>
      </div>

      {user.status === 'rejected' && user.rejectionReason && (
        <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-xs font-medium text-red-400">
            <span className="font-bold uppercase">Reason for Rejection: </span>
            {user.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
}