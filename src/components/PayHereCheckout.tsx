import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  Landmark, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ArrowRight,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react';

interface PayHereCheckoutProps {
  merchantId: string;
  merchantName: string;
  orderId: string;
  items: string;
  amount: number;
  currency?: 'LKR' | 'USD';
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
  };
  isSandbox?: boolean;
  hash?: string;
  onSuccess: (paymentDetails: { orderId: string; paymentId: string; amount: number }) => void;
  onDismissed: () => void;
  onError: (error: string) => void;
}

type CheckoutStep = 'summary' | 'initiating' | 'gateway' | 'processing' | 'success' | 'failed';
type PaymentMethod = 'card' | 'wallet' | 'banking';

export function PayHereCheckout({
  merchantId,
  merchantName,
  orderId,
  items,
  amount,
  currency = 'LKR',
  customer,
  isSandbox = true,
  onSuccess,
  onDismissed,
  onError
}: PayHereCheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>('summary');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
    }).format(val).replace(currency, '').trim();
  };

  // Card detection
  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.match(/^5[1-5]/)) return 'Mastercard';
    if (cleanNumber.match(/^3[47]/)) return 'Amex';
    return 'Unknown';
  };

  // Format card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    setCardNumber(formattedValue.slice(0, 19));
  };

  // Format expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiry(value);
  };

  const handleInitiate = () => {
    setStep('initiating');
    setTimeout(() => {
      setStep('gateway');
    }, 1500);
  };

  const handleSimulatePayment = () => {
    if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvv)) {
      onError("Please fill all card details.");
      return;
    }
    
    setStep('processing');
    
    // Simulate 3D Secure / Processing
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate in demo
      if (isSuccess) {
        const ref = `PH${Date.now().toString().slice(-8)}`;
        setTransactionRef(ref);
        setStep('success');
      } else {
        setStep('failed');
      }
    }, 2500);
  };

  const fillDemoCard = () => {
    setCardNumber('4111 1111 1111 1111');
    setExpiry('12/25');
    setCvv('123');
  };

  const renderSummaryScreen = () => (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">{merchantName}</h2>
          <p className="text-slate-400 text-sm mt-1">Payment Checkout</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
            <p className="text-slate-200 font-mono text-sm">{orderId}</p>
          </div>
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Customer</p>
            <p className="text-slate-200 text-sm truncate">{customer.firstName} {customer.lastName}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3 border-b border-slate-800 pb-2">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-sm">{items}</span>
              <span className="text-slate-200 font-mono text-sm">{currency} {formatCurrency(amount)}</span>
            </div>
            {/* Optional processing fee visualization */}
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm">Processing Fee</span>
              <span className="text-slate-500 font-mono text-sm">Free</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-slate-300 font-medium">Grand Total</span>
          <div className="text-right">
            <span className="text-amber-500 font-bold text-2xl font-mono tracking-tight">
              <span className="text-amber-500/70 text-sm mr-1">{currency}</span>
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 flex gap-3 items-center">
          <Lock className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-emerald-200/70">
            256-Bit SSL Encrypted & Central Bank of Sri Lanka Regulated
          </p>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-6 bg-slate-950 border-t border-slate-800">
        <button
          onClick={handleInitiate}
          disabled={step === 'initiating'}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium px-6 py-4 transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-3"
        >
          {step === 'initiating' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting to Gateway...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-blue-200" />
              <span>Pay with</span>
              <div className="flex items-center text-lg tracking-tight font-bold ml-1">
                <span className="text-white">pay</span>
                <span className="text-red-400">here</span>
              </div>
            </>
          )}
        </button>
        <button
          onClick={onDismissed}
          className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Cancel and return
        </button>
      </div>
    </div>
  );

  const renderGatewayModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismissed} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0d14] rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Gateway Header */}
        <div className="flex-none bg-[#131722] p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-2xl tracking-tight font-black">
              <span className="text-white">pay</span>
              <span className="text-[#ef4444]">here</span>
            </div>
            {isSandbox && (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20 tracking-wider">
                SANDBOX
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400/80">
              <Lock className="w-3.5 h-3.5" />
              256-bit SSL
            </div>
            <button onClick={onDismissed} className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Summary Banner */}
        <div className="flex-none bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">{merchantName} • {orderId}</p>
            <p className="text-slate-200 text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{items}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-500 font-bold text-xl font-mono tracking-tight">
              {currency} {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Gateway Body */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col md:flex-row">
          
          {/* Payment Methods Sidebar */}
          <div className="w-full md:w-56 flex-none bg-[#131722] border-r border-slate-800 p-3 space-y-1">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                paymentMethod === 'card' 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Credit / Debit
            </button>
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                paymentMethod === 'wallet' 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile Wallets
            </button>
            <button
              onClick={() => setPaymentMethod('banking')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                paymentMethod === 'banking' 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Internet Banking
            </button>
          </div>

          {/* Payment Details Area */}
          <div className="flex-1 p-5 sm:p-8 bg-[#0a0d14]">
            {paymentMethod === 'card' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-200 font-medium">Card Information</h3>
                  <div className="flex gap-2">
                    {/* Fake card brand icons */}
                    <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                    <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold text-white">MC</div>
                    <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold text-white">AMEX</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-[#131722] border border-slate-700 text-slate-100 placeholder:text-slate-600 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                      {cardNumber && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">
                          {getCardType(cardNumber)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                      <input 
                        type="text" 
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full bg-[#131722] border border-slate-700 text-slate-100 placeholder:text-slate-600 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        CVV
                        <Info className="w-3 h-3 text-slate-500 cursor-help" />
                      </label>
                      <input 
                        type="text" 
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full bg-[#131722] border border-slate-700 text-slate-100 placeholder:text-slate-600 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {isSandbox && (
                  <button 
                    onClick={fillDemoCard}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500/80 border border-amber-500/20 border-dashed rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    Fill Demo Sandbox Card
                  </button>
                )}
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                  <Smartphone className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-200 font-medium text-lg">Mobile Wallets</h3>
                <p className="text-slate-400 text-sm max-w-[250px]">
                  Pay securely using your preferred mobile wallet provider.
                </p>
                <div className="flex gap-3 pt-4">
                  <div className="px-4 py-2 bg-[#131722] border border-slate-700 rounded-lg text-sm font-medium text-slate-300">eZ Cash</div>
                  <div className="px-4 py-2 bg-[#131722] border border-slate-700 rounded-lg text-sm font-medium text-slate-300">mCash</div>
                </div>
              </div>
            )}

            {paymentMethod === 'banking' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                  <Landmark className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-200 font-medium text-lg">Internet Banking</h3>
                <p className="text-slate-400 text-sm max-w-[280px]">
                  Select your bank to proceed with direct account transfer.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  <div className="px-3 py-1.5 bg-[#131722] border border-slate-700 rounded-lg text-xs font-medium text-slate-300">Sampath Vishwa</div>
                  <div className="px-3 py-1.5 bg-[#131722] border border-slate-700 rounded-lg text-xs font-medium text-slate-300">ComBank</div>
                  <div className="px-3 py-1.5 bg-[#131722] border border-slate-700 rounded-lg text-xs font-medium text-slate-300">HNB</div>
                  <div className="px-3 py-1.5 bg-[#131722] border border-slate-700 rounded-lg text-xs font-medium text-slate-300">FriMi</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-none bg-[#131722] p-4 sm:p-6 border-t border-slate-800 flex flex-col items-center gap-4">
          <button
            onClick={handleSimulatePayment}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-bold px-6 py-4 transition-all duration-300 shadow-lg shadow-red-900/30 flex items-center justify-between group"
          >
            <span>Pay {currency} {formatCurrency(amount)}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span>PCI-DSS Level 1 Certified</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>Regulated by CBSL</span>
          </div>
        </div>
        
      </div>
    </div>
  );

  const renderProcessingScreen = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0d14]/95 backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
          <Lock className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
        <p className="text-slate-400 text-sm">Authorizing with Bank 3D Secure...</p>
        <p className="text-slate-500 text-xs mt-6">Please do not close this window or press back.</p>
      </div>
    </div>
  );

  const renderResultScreen = () => {
    const isSuccess = step === 'success';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
        <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 text-center animate-in zoom-in-95 duration-300">
          
          <div className="mb-6 flex justify-center">
            {isSuccess ? (
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75"></div>
                <CheckCircle2 className="w-10 h-10 text-emerald-500 relative z-10" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {isSuccess 
              ? `Your payment of ${currency} ${formatCurrency(amount)} has been successfully processed.` 
              : 'We could not process your payment. Please check your card details or try a different method.'}
          </p>

          {isSuccess && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-left mb-8 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Reference No</span>
                <span className="text-slate-200 font-mono font-medium">{transactionRef}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Method</span>
                <span className="text-slate-200 capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {isSuccess ? (
              <>
                <button 
                  onClick={() => onSuccess({ orderId, paymentId: transactionRef, amount })}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Service
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setStep('gateway')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3.5 font-medium transition-colors"
                >
                  Try Again
                </button>
                <button 
                  onClick={onDismissed}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Cancel and return to merchant
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {step === 'summary' && renderSummaryScreen()}
      {(step === 'initiating' || step === 'gateway') && renderGatewayModal()}
      {step === 'processing' && renderProcessingScreen()}
      {(step === 'success' || step === 'failed') && renderResultScreen()}
    </>
  );
}
