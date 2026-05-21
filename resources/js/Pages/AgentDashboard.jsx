import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function AgentDashboard(props) {
    const { stats, transactions = [], bookings = [] } = props;

    // Accessibility Context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    // Top-up wallet form
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
    });

    const handleDeposit = (e) => {
        e.preventDefault();
        post(route('agent.deposit'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout header="Authorized Agent Workspace">
            <Head title="Agent Dashboard - Rail-Bharat" />

            {/* Top Stat widgets panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Balance */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Wallet Balance</span>
                        <h4 className="text-2xl font-extrabold text-slate-100 mt-1">₹{Number(stats?.wallet_balance).toFixed(2)}</h4>
                    </div>
                    <span className="text-2xl">💳</span>
                </div>

                {/* Total Bookings */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Tickets</span>
                        <h4 className="text-2xl font-extrabold text-slate-100 mt-1">{stats?.total_bookings || 0}</h4>
                    </div>
                    <span className="text-2xl">🎟️</span>
                </div>

                {/* Total Spent */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Spent</span>
                        <h4 className="text-2xl font-extrabold text-rose-450 mt-1">₹{Number(stats?.total_spent).toFixed(2)}</h4>
                    </div>
                    <span className="text-2xl">💸</span>
                </div>

                {/* 2% Cashback Earned */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Commission Earned (2%)</span>
                        <h4 className="text-2xl font-extrabold text-emerald-450 mt-1">₹{Number(stats?.total_commission).toFixed(2)}</h4>
                    </div>
                    <span className="text-2xl">💰</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Top-up wallet and Transaction logs */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Wallet Top-up Panel */}
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 shadow-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Simulated Wallet Deposit</h3>
                        <p className="text-xs opacity-50 mb-4">Add virtual currency to your booking wallet to speed up tickets reservations.</p>

                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <input
                                    type="number"
                                    min="100"
                                    max="50000"
                                    placeholder="Enter deposit amount (₹100 - ₹50,000)"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className={`w-full text-xs rounded-xl px-3.5 py-3 focus:ring-1 focus:outline-none ${
                                        highContrast
                                            ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                            : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                    }`}
                                />
                                {errors.amount && (
                                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{errors.amount}</span>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-3 rounded-xl font-bold text-xs uppercase transition-all shadow-md ${
                                    highContrast
                                        ? 'bg-yellow-400 text-black border-2 border-yellow-400 font-extrabold'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                            >
                                Deposit Money
                            </button>
                        </form>
                    </div>

                    {/* Transaction Ledger */}
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Wallet Ledger</h3>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 divide-y divide-slate-850/40">
                            {transactions.length === 0 ? (
                                <div className="text-center py-6 text-xs opacity-50">No transaction logs available</div>
                            ) : (
                                transactions.map((t) => (
                                    <div key={t.id} className="pt-3 first:pt-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs font-bold text-slate-200">{t.description}</span>
                                            <span className={`text-xs font-extrabold ${t.type === 'Credit' ? 'text-emerald-400' : 'text-rose-455'}`}>
                                                {t.type === 'Credit' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
                                            </span>
                                        </div>
                                        <span className="text-[9px] opacity-40 block mt-0.5">
                                            {new Date(t.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Bulk bookings history */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Agent Bookings History</h3>

                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="text-center py-10 text-xs opacity-50">
                                    No bookings made yet. Start booking tickets to earn commissions.
                                </div>
                            ) : (
                                bookings.map((booking) => (
                                    <div 
                                        key={booking.id}
                                        className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${
                                            highContrast 
                                                ? 'border-yellow-400 bg-black text-yellow-300' 
                                                : 'bg-slate-900/15 border-slate-900/70 hover:border-slate-850'
                                        }`}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className="text-2xl">🎫</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-200 text-xs">{booking.train?.name}</span>
                                                    <span className="text-[10px] font-mono text-orange-400 font-semibold">PNR: {booking.pnr}</span>
                                                </div>
                                                <span className="text-[10px] opacity-45 block mt-1 font-semibold">
                                                    {booking.source_station?.code} ➔ {booking.destination_station?.code} • {new Date(booking.journey_date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                </span>
                                                <span className="text-[9px] opacity-40 block mt-0.5">
                                                    Passengers: {booking.passengers?.map(p => p.name).join(', ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between md:justify-end items-center gap-6">
                                            <div className="text-left md:text-right">
                                                <span className="text-xs font-bold text-slate-200 block">₹{booking.total_fare}</span>
                                                <span className={`text-[9px] font-bold uppercase block mt-0.5 ${
                                                    booking.status === 'Cancelled' ? 'text-rose-500' : booking.status === 'Partial' ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/catering/${booking.pnr}`}
                                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-wider ${
                                                        highContrast
                                                            ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                                                            : 'border-orange-550/30 bg-orange-950/20 text-orange-400 hover:bg-orange-650 hover:text-white'
                                                    }`}
                                                >
                                                    Catering
                                                </Link>
                                                <Link
                                                    href={`/bookings/${booking.pnr}`}
                                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-wider ${
                                                        highContrast
                                                            ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black font-bold'
                                                            : 'border-slate-850 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                                                    }`}
                                                >
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
