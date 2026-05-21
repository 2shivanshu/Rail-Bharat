import { Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function PnrChecker() {
    const [pnr, setPnr] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (pnr.length !== 10) {
            setError('Please enter a valid 10-digit PNR number.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('/pnr/lookup', { pnr });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'PNR lookup failed. Please check the number and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
            <Head title="Public PNR Search - Rail-Bharat" />

            {/* Glowing Background Orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Main Header / Navbar */}
            <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/10">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-white to-emerald-400">
                            RAIL-BHARAT
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-xs font-bold text-slate-350 hover:text-slate-100 transition-all uppercase tracking-wider"
                        >
                            Home ➔
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-12 relative z-10">
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Public PNR Status Enquiry
                    </h1>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Check current waitlist numbers, coach and seat assignments, and live delays without logging into your account.
                    </p>
                </div>

                {/* Lookup Form */}
                <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur-md mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            maxLength="10"
                            placeholder="Enter 10-digit PNR Number (e.g. 482930219)"
                            value={pnr}
                            onChange={(e) => setPnr(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 text-xs rounded-xl px-4 py-3 bg-slate-950 border border-slate-850 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none font-semibold text-center sm:text-left"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                'Lookup Status ➔'
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Result Display */}
                {result && (
                    <div className="space-y-6">
                        {/* Journey Summary Card */}
                        <div className="rounded-3xl bg-slate-900/40 border border-slate-850 p-6 shadow-md relative overflow-hidden">
                            {/* Indian Flag Strip */}
                            <div className="absolute top-0 inset-x-0 h-1 flex">
                                <div className="flex-1 bg-orange-500"></div>
                                <div className="flex-1 bg-white"></div>
                                <div className="flex-1 bg-emerald-500"></div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-100">
                                        {result.booking.train?.name}
                                    </h3>
                                    <span className="text-[10px] font-mono opacity-50 block mt-0.5">
                                        Train: #{result.booking.train?.train_number} • Class: {result.booking.class_type}
                                    </span>
                                </div>
                                <div className="text-right sm:text-right">
                                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/40 border border-orange-900/30 px-3 py-1 rounded-xl">
                                        PNR: {result.booking.pnr}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4 py-6 border-y border-slate-850/50 my-5">
                                <div className="text-center sm:text-left">
                                    <span className="text-[10px] font-bold opacity-45 uppercase block mb-1">Departure</span>
                                    <span className="text-xs font-extrabold text-slate-200 block">
                                        {result.booking.source_station?.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-orange-400 font-bold">
                                        ({result.booking.source_station?.code})
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-2xl text-slate-700">➔</span>
                                </div>

                                <div className="text-center sm:text-right">
                                    <span className="text-[10px] font-bold opacity-45 uppercase block mb-1">Arrival</span>
                                    <span className="text-xs font-extrabold text-slate-200 block">
                                        {result.booking.destination_station?.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-orange-400 font-bold">
                                        ({result.booking.destination_station?.code})
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                                <div>
                                    <span className="opacity-50 font-medium">Journey Date: </span>
                                    <span className="font-bold text-emerald-400">
                                        {new Date(result.booking.journey_date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                {result.delay_minutes > 0 ? (
                                    <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
                                        ⚠️ Running Delayed by {result.delay_minutes} Mins
                                    </div>
                                ) : (
                                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                                        ✓ On Time
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Passenger Status Details Card */}
                        <div className="rounded-3xl bg-slate-900/40 border border-slate-850 p-6 shadow-md">
                            <h3 className="font-bold text-xs uppercase tracking-wider mb-4 text-slate-400">
                                Passenger Status Details
                            </h3>

                            <div className="space-y-4">
                                {result.booking.passengers?.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className="p-4 rounded-2xl bg-slate-950 border border-slate-900 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                                    >
                                        <div>
                                            <span className="text-xs font-bold text-slate-200 block">
                                                {idx + 1}. {p.name}
                                            </span>
                                            <span className="text-[10px] opacity-50 block mt-0.5">
                                                {p.gender} • Age: {p.age}
                                            </span>
                                        </div>

                                        <div className="flex gap-6 items-center justify-between sm:justify-end">
                                            <div className="text-right">
                                                <span className="text-[10px] opacity-45 uppercase font-bold block">Coach</span>
                                                <span className="text-xs font-extrabold text-slate-200">
                                                    {p.coach_number || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] opacity-45 uppercase font-bold block">Berth / Seat</span>
                                                <span className="text-xs font-extrabold text-slate-200">
                                                    {p.seat_number || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] opacity-45 uppercase font-bold block">Status</span>
                                                <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                                    p.status === 'CNF'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : p.status === 'RAC'
                                                        ? 'bg-amber-500/10 text-amber-400'
                                                        : p.status === 'CANCELLED'
                                                        ? 'bg-rose-500/10 text-rose-400'
                                                        : 'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                    {p.status} {p.wl_number ? `WL - ${p.wl_number}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
