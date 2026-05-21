import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function Payment({ booking }) {
    // Use Accessibility Settings from layout context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    const { auth = {} } = usePage().props;
    const user = auth.user;
    const isAgent = user?.role === 'agent';
    const walletBalance = parseFloat(user?.wallet_balance || 0);

    const [selectedMethod, setSelectedMethod] = useState(isAgent ? 'Wallet' : 'UPI');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [upiId, setUpiId] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Timer Countdown
    useEffect(() => {
        if (timeLeft <= 0) {
            alert("Seat lock expired! Returning to home.");
            router.get('/');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Format timer
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    };

    // Submit Simulated Payment status
    const triggerPayment = (status) => {
        setProcessingPayment(true);
        
        router.post(route('payment.process', booking.id), {
            payment_status: status,
            payment_method: selectedMethod,
        }, {
            onFinish: () => setProcessingPayment(false)
        });
    };

    return (
        <AuthenticatedLayout header="Simulated Payment Gateway">
            <Head title="Secure Payment - Rail-Bharat" />

            <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Timer Alert Card */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    highContrast
                        ? 'border-yellow-400 bg-black text-yellow-300 font-bold'
                        : 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                }`}>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        <span>⏳ Seat Lock Active</span>
                    </div>
                    <div className="text-lg font-extrabold font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Booking details summary */}
                <div className={`p-6 rounded-3xl border ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <h3 className="font-bold text-xs uppercase tracking-wider mb-3.5 border-b border-slate-800 pb-2">Booking Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-y-3.5 text-xs font-semibold">
                        <div>
                            <span className="opacity-50 block text-[10px] uppercase">Train</span>
                            <span className="text-slate-200 mt-0.5 block">{booking.train?.name} (#{booking.train?.train_number})</span>
                        </div>
                        <div>
                            <span className="opacity-50 block text-[10px] uppercase">Journey Date</span>
                            <span className="text-slate-200 mt-0.5 block">{new Date(booking.journey_date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                        </div>
                        <div>
                            <span className="opacity-50 block text-[10px] uppercase">Route</span>
                            <span className="text-slate-200 mt-0.5 block">{booking.source_station?.code} ➔ {booking.destination_station?.code}</span>
                        </div>
                        <div>
                            <span className="opacity-50 block text-[10px] uppercase">Temporary PNR</span>
                            <span className="text-slate-200 font-mono mt-0.5 block">{booking.pnr}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-850 my-4"></div>

                    <div className="flex justify-between items-center text-sm font-extrabold">
                        <span>Amount to Pay</span>
                        <span className="text-orange-400 text-base">₹{booking.total_fare}</span>
                    </div>
                </div>

                {/* Simulated Payment Selector Sheet */}
                <div className={`p-6 rounded-3xl border space-y-6 ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-850'
                }`}>
                    <div>
                        <h3 className="font-bold text-sm text-slate-100">Select Payment Method</h3>
                        <p className="text-[11px] opacity-50 mt-0.5">Choose a portal to simulate your payment settlement</p>
                    </div>

                    <div className={`grid gap-3 ${isAgent ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
                        {(isAgent ? ['UPI', 'Card', 'Netbanking', 'Wallet'] : ['UPI', 'Card', 'Netbanking']).map(method => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setSelectedMethod(method)}
                                className={`py-3 rounded-2xl border font-bold text-xs transition-all ${
                                    selectedMethod === method
                                        ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-orange-500/10 border-orange-500/40 text-orange-400')
                                        : (highContrast ? 'border-yellow-400 text-yellow-300' : 'border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300')
                                }`}
                            >
                                {method === 'UPI' ? '📱 UPI' : method === 'Card' ? '💳 Card' : method === 'Netbanking' ? '🏦 Netbank' : '💼 Wallet'}
                            </button>
                        ))}
                    </div>

                    {/* Method details fields */}
                    <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900/60">
                        {selectedMethod === 'UPI' && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Virtual Payment Address (VPA)</label>
                                <input
                                    type="text"
                                    placeholder="username@okaxis"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                        highContrast
                                            ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                            : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                    }`}
                                />
                            </div>
                        )}

                        {selectedMethod === 'Card' && (
                            <div className="grid grid-cols-12 gap-3 text-left">
                                <div className="col-span-12 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="•••• •••• •••• ••••"
                                        className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500 focus:ring-1 focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-8 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500 focus:ring-1 focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">CVV</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500 focus:ring-1 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'Netbanking' && (
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Select Bank</label>
                                <select className="w-full text-xs rounded-xl px-3 py-2.5 bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500 focus:ring-1 focus:outline-none">
                                    <option>State Bank of India (SBI)</option>
                                    <option>HDFC Bank</option>
                                    <option>ICICI Bank</option>
                                    <option>Punjab National Bank (PNB)</option>
                                </select>
                            </div>
                        )}

                        {selectedMethod === 'Wallet' && (
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold uppercase text-slate-400">Agent Wallet Balance</span>
                                    <span className={`font-mono font-extrabold ${walletBalance >= booking.total_fare ? 'text-emerald-400' : 'text-rose-450'}`}>
                                        ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-900 my-2"></div>
                                <div className="text-[11px] opacity-75">
                                    {walletBalance >= booking.total_fare ? (
                                        <span className="text-emerald-400">✓ Balance is sufficient. Proceed to pay. You will earn a 2.0% cashback commission (₹{(booking.total_fare * 0.02).toFixed(2)}).</span>
                                    ) : (
                                        <span className="text-rose-400 font-bold">✗ Insufficient funds in wallet. Please deposit money in Agent Portal.</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Simulated triggers buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => triggerPayment('Failed')}
                            disabled={processingPayment}
                            className="py-3.5 rounded-2xl border border-rose-500/20 hover:bg-rose-950/20 text-rose-500 font-bold text-xs tracking-wider uppercase transition-all"
                        >
                            Simulate Failure
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => triggerPayment('Success')}
                            disabled={processingPayment || (selectedMethod === 'Wallet' && walletBalance < booking.total_fare)}
                            className={`py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-md ${
                                (processingPayment || (selectedMethod === 'Wallet' && walletBalance < booking.total_fare))
                                    ? 'bg-slate-800 text-slate-500 border-slate-850 cursor-not-allowed'
                                    : highContrast
                                        ? 'bg-yellow-400 text-black border-2 border-yellow-400 font-extrabold'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
                            }`}
                        >
                            {processingPayment ? 'Confirming...' : 'Simulate Success ➔'}
                        </button>
                    </div>

                    <div className="text-center text-[10px] opacity-40 leading-relaxed max-w-sm mx-auto">
                        🔒 Secured using mock TLS 1.3 protocol. No actual financial operations or card deductions occur.
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
