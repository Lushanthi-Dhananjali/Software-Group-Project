import React, { useState } from 'react';
import { PaymentSlip, PhysicsClass, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { CreditCard, Landmark, UploadCloud, CheckCircle2, AlertCircle, Clock, Check, X, ShieldAlert, MapPin, Truck, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Helper function to download receipt as PDF
const downloadTransactionPDF = (slip: PaymentSlip, lang: Language) => {
  const doc = new jsPDF();
  
  // Custom styling & header background
  doc.setFillColor(15, 23, 42); // slate-900 background
  doc.rect(10, 10, 190, 40, 'F');
  
  // Header Title
  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CHANNEL A+ PHYSICS", 15, 26);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Advanced Level Physics LMS & Live Stream Hub", 15, 34);
  doc.text("Official Payment Transaction Receipt", 15, 40);

  // Document Title
  doc.setTextColor(15, 23, 42); // slate-900 for body
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT / TRANSACTION DETAILS", 15, 65);
  
  // Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(10, 70, 200, 70);

  // Transaction Attributes
  doc.setFontSize(11);
  
  const drawRow = (label: string, value: string, y: number, isHighlighted: boolean = false) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(label, 15, y);
    
    doc.setFont("helvetica", isHighlighted ? "bold" : "normal");
    doc.setTextColor(isHighlighted ? 245 : 15, isHighlighted ? 158 : 23, isHighlighted ? 11 : 42);
    doc.text(value, 70, y);
  };

  drawRow("Transaction ID:", slip.id, 80);
  drawRow("Student Index No:", slip.indexNo, 90);
  drawRow("Student Name:", slip.studentName, 100);
  drawRow("Registered Batch:", `${slip.batch} Theory`, 110);
  drawRow("Class / Module:", slip.className[lang] || slip.className.en, 120);
  drawRow("Fee Month:", slip.month, 130);
  drawRow("Fee Paid Amount:", `LKR ${slip.amountPaid}.00`, 140, true);
  
  const uploadDate = slip.uploadedAt ? new Date(slip.uploadedAt).toLocaleString() : new Date().toLocaleString();
  drawRow("Submission Date:", uploadDate, 150);

  // Status with custom color
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Payment Status:", 15, 160);
  
  const statusUpper = slip.status.toUpperCase();
  if (slip.status === 'approved') {
    doc.setTextColor(16, 185, 129); // emerald-500
  } else if (slip.status === 'rejected') {
    doc.setTextColor(239, 68, 68); // red-500
  } else {
    doc.setTextColor(245, 158, 11); // amber-500
  }
  doc.setFont("helvetica", "bold");
  doc.text(statusUpper, 70, 160);

  // Delivery details if printed book requested
  if (slip.wantsPrintedMaterials) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Courier Book Post:", 15, 172);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text("Yes, Courier Booklet Delivery requested (+LKR 200 included)", 70, 172);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Mailing Address:", 15, 182);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const splitAddress = doc.splitTextToSize(slip.postalAddress || "No address provided", 120);
    doc.text(splitAddress, 70, 182);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Courier Book Post:", 15, 172);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text("No, Digital Study Materials online download only.", 70, 172);
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(10, 220, 200, 220);

  // Footer text
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("This is an electronically generated tuition fee payment receipt. No physical signature is required.", 15, 230);
  doc.text("For any support, please contact A+ Live Support Chat with your index registration code.", 15, 235);
  doc.text("Thank you for choosing NextGEN LMS with Dr. Aritha Perera.", 15, 240);

  // Download PDF
  doc.save(`Receipt-${slip.month}-${slip.indexNo}.pdf`);
};

interface PaymentCenterProps {
  userClasses: PhysicsClass[];
  slips: PaymentSlip[];
  lang: Language;
  onUploadSlip: (slip: { 
    classId: string; 
    month: string; 
    amountPaid: number; 
    slipImageUrl: string;
    wantsPrintedMaterials?: boolean;
    postalAddress?: string;
    isOnlinePayment?: boolean;
    slipId?: string;
  }) => void;
  currentUserAddress?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserId?: string;
}

const MONTHS = [
  "June 2026", "July 2026", "August 2026", "September 2026"
];

// Presets of bank receipt mock photos for easy click-to-fill simulation
const SAMPLE_SLIPS = [
  { label: "BOC Blue Slip Receipt", url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80" },
  { label: "Sampath Bank PaySlip", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80" },
  { label: "Commercial Bank Transfer", url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=600&q=80" }
];

export default function PaymentCenter({ 
  userClasses, 
  slips, 
  lang, 
  onUploadSlip, 
  currentUserAddress,
  currentUserEmail,
  currentUserName,
  currentUserId
}: PaymentCenterProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'bank' | 'payhere'>('bank');
  const [payherePhone, setPayherePhone] = useState<string>('0771234567');
  const [isPayhereLoading, setIsPayhereLoading] = useState<boolean>(false);

  const [selectedClassId, setSelectedClassId] = useState<string>(userClasses[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0]);
  const [amount, setAmount] = useState<number>(userClasses[0]?.fee || 3000);
  const [slipUrl, setSlipUrl] = useState<string>('');
  const [wantsPrinted, setWantsPrinted] = useState<boolean>(false);
  const [postalAddress, setPostalAddress] = useState<string>(currentUserAddress || '');
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedClassId(cId);
    const selectedClass = userClasses.find(c => c.id === cId);
    if (selectedClass) {
      setAmount(selectedClass.fee);
    }
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !slipUrl.trim()) {
      alert(t.slipError);
      return;
    }
    setShowConfirmPopup(true);
  };

  const executeSubmit = () => {
    if (wantsPrinted && !postalAddress.trim()) {
      alert("Please provide a valid postal address for delivery.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg('');
    setShowConfirmPopup(false);

    // Single upload: total includes the Rs. 200 delivery fee if printed option is selected
    const totalAmount = amount + (wantsPrinted ? 200 : 0);

    setTimeout(() => {
      onUploadSlip({
        classId: selectedClassId,
        month: selectedMonth,
        amountPaid: totalAmount,
        slipImageUrl: slipUrl,
        wantsPrintedMaterials: wantsPrinted,
        postalAddress: wantsPrinted ? postalAddress : undefined
      });
      setIsSubmitting(false);
      setSuccessMsg(t.slipSuccess);
      setSlipUrl('');
      setWantsPrinted(false);
    }, 1500);
  };

  const loadPayHereSDK = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).payhere) {
        resolve((window as any).payhere);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.type = 'text/javascript';
      script.onload = () => resolve((window as any).payhere);
      document.body.appendChild(script);
    });
  };

  const handlePayHerePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert("Please select a class first.");
      return;
    }
    if (wantsPrinted && !postalAddress.trim()) {
      alert("Please enter a valid postal address for delivery.");
      return;
    }

    setIsPayhereLoading(true);
    setSuccessMsg('');

    const targetClass = userClasses.find(c => c.id === selectedClassId) || userClasses[0];
    const totalAmount = amount + (wantsPrinted ? 200 : 0);
    const formattedMonth = selectedMonth.replace(/\s+/g, '-');
    const orderId = `pay_${currentUserId || 'student'}_${selectedClassId}_${formattedMonth}_${Date.now()}`;

    try {
      // 1. Fetch secure MD5 signature hash from backend
      const hashUrl = `/api/payhere-hash?order_id=${encodeURIComponent(orderId)}&amount=${totalAmount}&currency=LKR`;
      const res = await fetch(hashUrl);
      if (!res.ok) {
        throw new Error("Failed to retrieve secure transaction signature.");
      }
      const hashData = await res.json();

      // 2. Load PayHere script SDK dynamically
      const payhere = await loadPayHereSDK();

      // 3. Prepare parameters
      const nameParts = (currentUserName || "Online Student").trim().split(/\s+/);
      const firstName = nameParts[0] || "Online";
      const lastName = nameParts.slice(1).join(' ') || "Student";

      const payment = {
        sandbox: hashData.sandbox,
        merchant_id: hashData.merchant_id,
        return_url: window.location.origin + '/profile',
        cancel_url: window.location.origin + '/profile',
        notify_url: window.location.origin + '/api/payhere-notify',
        order_id: orderId,
        items: `${targetClass ? targetClass.name[lang] || targetClass.name.en : "Physics Class"} - ${selectedMonth}`,
        amount: totalAmount.toString(),
        currency: "LKR",
        hash: hashData.hash,
        first_name: firstName,
        last_name: lastName,
        email: currentUserEmail || "student@channelaplus.edu.lk",
        phone: payherePhone || "0771234567",
        address: wantsPrinted ? postalAddress : "Online Student Address",
        city: "Colombo",
        country: "Sri Lanka",
        custom_1: wantsPrinted ? "wants_printed_true" : "wants_printed_false",
        custom_2: wantsPrinted ? postalAddress : ""
      };

      // 4. Fire Checkout popup
      payhere.startPayment(payment);

      payhere.onCompleted = function (orderIdVal: string) {
        console.log("Payment completed:", orderIdVal);
        onUploadSlip({
          classId: selectedClassId,
          month: selectedMonth,
          amountPaid: totalAmount,
          slipImageUrl: "https://www.payhere.lk/assets/images/payhere_logo.png",
          wantsPrintedMaterials: wantsPrinted,
          postalAddress: wantsPrinted ? postalAddress : undefined,
          isOnlinePayment: true,
          slipId: orderIdVal || orderId
        });
        setSuccessMsg("Payment verified & approved instantly! Your course content is now unlocked.");
        setIsPayhereLoading(false);
      };

      payhere.onDismissed = function () {
        console.log("Payment dismissed by user");
        setIsPayhereLoading(false);
      };

      payhere.onError = function (errorVal: string) {
        console.error("PayHere SDK error:", errorVal);
        alert("PayHere Checkout error: " + errorVal);
        setIsPayhereLoading(false);
      };

    } catch (err: any) {
      console.error("PayHere loading/hashing error:", err);
      alert("Unable to initiate online payment: " + err.message);
      setIsPayhereLoading(false);
    }
  };

  const activeSelectedClass = userClasses.find(c => c.id === selectedClassId) || userClasses[0];

  return (
    <div id="payment-center-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Payment methods panel */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        
        {/* TAB BAR SELECTOR */}
        <div id="payment-tabs-selectors" className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('bank'); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'border-amber-500 text-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Landmark className="h-4 w-4 text-amber-500" />
              Bank Slip Upload
            </div>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('payhere'); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'payhere'
                ? 'border-amber-500 text-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Pay Online (PayHere)
            </div>
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: BANK SLIP FORM */}
        {activeTab === 'bank' && (
          <form onSubmit={handlePreSubmitCheck} className="space-y-4 text-xs">
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-2 pb-1 text-slate-200">
              <UploadCloud className="h-4.5 w-4.5 text-amber-400" />
              {t.uploadPaymentSlip}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  {t.selectClass}
                </label>
                <select
                  id="payment-class-select"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {userClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name[lang]} (LKR {cls.fee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  {t.selectMonth}
                </label>
                <select
                  id="payment-month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Deposited Fee Amount (LKR)
              </label>
              <input
                id="payment-amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Receipt Image URL / Slip Photo
              </label>
              <input
                id="payment-slip-url-input"
                type="text"
                value={slipUrl}
                onChange={(e) => setSlipUrl(e.target.value)}
                placeholder="Paste image link, or click a mock preset below"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
              />

              {/* Click-to-fill sample presets */}
              <div className="mt-2.5 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Presets:</span>
                {SAMPLE_SLIPS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setSlipUrl(preset.url)}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {slipUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 max-w-sm">
                <span className="text-[9px] font-mono text-slate-500 block mb-1">Receipt Preview:</span>
                <img
                  src={slipUrl}
                  alt="Receipt upload preview"
                  className="w-full object-cover h-36 rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? t.submittingSlip : t.slipUploadBtn}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PAYHERE ONLINE CHECKOUT FORM */}
        {activeTab === 'payhere' && (
          <form onSubmit={handlePayHerePayment} className="space-y-4 text-xs animate-in fade-in duration-200">
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-2 pb-1 text-slate-200">
              <CreditCard className="h-4.5 w-4.5 text-amber-400" />
              Online Payment (Visa, MasterCard, eZ Cash, mCash)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  Class / Module to Pay
                </label>
                <select
                  id="payhere-class-select"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {userClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name[lang]} (LKR {cls.fee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  Academic Month
                </label>
                <select
                  id="payhere-month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  Student Name (Billing)
                </label>
                <input
                  type="text"
                  value={currentUserName || "Online Student"}
                  disabled
                  className="w-full bg-slate-950/55 border border-slate-850 rounded-xl p-3 text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  Billing Email Address
                </label>
                <input
                  type="email"
                  value={currentUserEmail || "student@channelaplus.edu.lk"}
                  disabled
                  className="w-full bg-slate-950/55 border border-slate-850 rounded-xl p-3 text-slate-400 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Contact Phone Number (For gateway verification) <span className="text-red-500">*</span>
              </label>
              <input
                id="payhere-phone-input"
                type="tel"
                value={payherePhone}
                onChange={(e) => setPayherePhone(e.target.value)}
                placeholder="e.g. 0771234567"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Courier Materials delivery toggle */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <input
                  id="payhere-wants-printed"
                  type="checkbox"
                  checked={wantsPrinted}
                  onChange={(e) => setWantsPrinted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-amber-500 rounded border-slate-800 bg-slate-900 focus:ring-amber-500 cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="payhere-wants-printed" className="font-bold text-white cursor-pointer block">
                    Yes, post printed study booklets to my home
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Adds an additional <span className="font-bold text-amber-400">Rs. 200</span> courier shipping fee.
                  </p>
                </div>
              </div>

              {wantsPrinted && (
                <div className="space-y-1.5 pt-2 border-t border-slate-900 animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-[10px] font-mono uppercase tracking-wide text-slate-400 font-bold">
                    Delivery Mailing Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="payhere-postal-address"
                    value={postalAddress}
                    onChange={(e) => setPostalAddress(e.target.value)}
                    placeholder="Specify your complete physical home address including street name, city, and postal code..."
                    className="w-full bg-slate-900 border border-slate-805 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-500/50 min-h-[60px]"
                  />
                </div>
              )}
            </div>

            {/* Price breakdown invoice summary */}
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Class Monthly Tuition Fee:</span>
                <span className="text-slate-200">LKR {amount}.00</span>
              </div>
              {wantsPrinted && (
                <div className="flex justify-between text-purple-400 border-t border-dashed border-slate-800/60 pt-1.5">
                  <span>Postal Shipping & Handling:</span>
                  <span>+ LKR 200.00</span>
                </div>
              )}
              <div className="flex justify-between text-amber-500 font-bold border-t border-slate-800 pt-1.5 text-sm">
                <span>Total Payment Amount:</span>
                <span>LKR {amount + (wantsPrinted ? 200 : 0)}.00</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPayhereLoading || (wantsPrinted && !postalAddress.trim())}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isPayhereLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Connecting Secure Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4.5 w-4.5" />
                    Pay LKR {amount + (wantsPrinted ? 200 : 0)}.00 via PayHere
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono mt-2">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>SSL Secure 256-bit Bank Encrypted</span>
            </div>
          </form>
        )}
      </div>

      {/* CONFIRMATION POP-UP WINDOW / MODAL FOR INDIVIDUAL PAYMENT SLIP */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-amber-500" />
                Confirm printed study materials delivery?
              </h4>
              <button
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-300">
              <p className="leading-relaxed">
                Before uploading your bank deposit slip, please specify if you would like printed versions of your class materials mailed to your home address.
              </p>

              {/* Toggle option */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    id="indiv-wants-printed"
                    type="checkbox"
                    checked={wantsPrinted}
                    onChange={(e) => setWantsPrinted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-amber-500 rounded border-slate-800 bg-slate-900 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="indiv-wants-printed" className="font-bold text-white cursor-pointer block">
                      Yes, post printed study booklets to my home
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      This will add an additional <span className="font-bold text-amber-400">Rs. 200</span> for shipping to this payment slip total.
                    </p>
                  </div>
                </div>

                {wantsPrinted && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-slate-400 font-bold">
                      Delivery Mailing Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="indiv-postal-address"
                      value={postalAddress}
                      onChange={(e) => setPostalAddress(e.target.value)}
                      placeholder="Specify your complete physical home address including street name, city, and postal code..."
                      className={`w-full bg-slate-900 border text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-500/50 min-h-[60px] ${
                        !postalAddress.trim() ? 'border-red-500/50' : 'border-slate-850'
                      }`}
                    />
                    {!postalAddress.trim() && (
                      <p className="text-[10px] text-red-400 font-medium">
                        ⚠️ A postal delivery address is required before proceeding.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing summary */}
              <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Class Fee:</span>
                  <span className="text-slate-200">LKR {amount}</span>
                </div>
                {wantsPrinted && (
                  <div className="flex justify-between text-purple-400 border-t border-dashed border-slate-800/60 pt-1.5">
                    <span>Postal Delivery Fee:</span>
                    <span>+ LKR 200</span>
                  </div>
                )}
                <div className="flex justify-between text-amber-500 font-bold border-t border-slate-800 pt-1.5">
                  <span>Total Bill Amount:</span>
                  <span>LKR {amount + (wantsPrinted ? 200 : 0)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2.5 bg-slate-950/20">
              <button
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wide transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                disabled={isSubmitting || (wantsPrinted && !postalAddress.trim())}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/30 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wide transition-colors disabled:cursor-not-allowed"
              >
                Confirm & Submit Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helplines and Transactions History */}
      <div className="lg:col-span-5 space-y-6">
        {/* Banking details coordinates */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="h-4.5 w-4.5 text-amber-400" />
            {t.bankDetails}
          </h4>
          <div className="text-[11px] space-y-2.5 font-sans leading-relaxed text-slate-300">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <p className="font-bold text-amber-400">Bank of Ceylon (BOC) - Colombo</p>
              <p className="font-mono mt-0.5">Account: 88720119</p>
              <p className="text-[10px] text-slate-500">Holder: NextGEN LMS Institute</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <p className="font-bold text-amber-400">Sampath Bank - Gampaha Physical</p>
              <p className="font-mono mt-0.5">Account: 1045928102</p>
              <p className="text-[10px] text-slate-500">Holder: NextGEN Education Ltd.</p>
            </div>
          </div>
        </div>

        {/* Transactions History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
            {t.slipStatusHeader}
          </h4>

          <div className="space-y-2.5">
            {slips.length === 0 ? (
              <p className="text-slate-500 text-xs italic text-center py-6">No previous bank slip records found.</p>
            ) : (
              slips.map((slip) => (
                <div key={slip.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-slate-500 block">{slip.month}</span>
                    <h5 className="font-bold text-slate-200 truncate leading-tight">
                      {slip.className[lang]}
                    </h5>
                    <span className="font-mono text-[10px] text-amber-500 mt-1 block">
                      LKR {slip.amountPaid}
                    </span>
                    {slip.status === 'rejected' && slip.comments && (
                      <p className="text-[10px] text-red-400 font-medium bg-red-500/5 p-2 rounded border border-red-500/10 mt-1.5 leading-relaxed">
                        Reason: {slip.comments}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right flex flex-col items-end gap-2">
                    {slip.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <Check className="h-3 w-3" /> Approved
                      </span>
                    )}
                    {slip.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400 border border-yellow-500/20 animate-pulse">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                    {slip.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                        <X className="h-3 w-3" /> Rejected
                      </span>
                    )}

                    <button
                      onClick={() => downloadTransactionPDF(slip, lang)}
                      title="Download PDF Receipt"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 text-[10px] font-semibold tracking-wider transition-colors cursor-pointer"
                    >
                      <Download className="h-2.5 w-2.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
