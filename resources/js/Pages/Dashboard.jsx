import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function Dashboard(props) {
    const { bookings = [], upcoming = [], notifications = [], stats } = props;

    // Accessibility Context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;
    const t = context ? context.t : (k) => k;

    // PNR Enquiry Search State
    const [searchPnr, setSearchPnr] = useState('');

    const handlePnrSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchPnr.trim() || searchPnr.length < 5) {
            alert("Please enter a valid PNR number.");
            return;
        }
        router.get(`/bookings/${searchPnr}`);
    };

    return (
        <AuthenticatedLayout header="Passenger Portal Dashboard">
            <Head title="My Dashboard - Rail-Bharat" />

            {/* Top Stat widgets panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Metric 1 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Tickets Booked</span>
                        <h4 className="text-2xl font-extrabold text-slate-100 mt-1">{stats?.total_bookings || 0}</h4>
                    </div>
                    <span className="text-2xl">🎫</span>
                </div>

                {/* Metric 2 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Upcoming Trips</span>
                        <h4 className="text-2xl font-extrabold text-slate-100 mt-1">{stats?.upcoming_trips || 0}</h4>
                    </div>
                    <span className="text-2xl">🌍</span>
                </div>

                {/* Metric 3 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Active Grievances</span>
                        <h4 className="text-2xl font-extrabold text-orange-400 mt-1">{stats?.active_complaints || 0}</h4>
                    </div>
                    <span className="text-2xl">📝</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Upcoming trips, PNR search, history */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* PNR Search Card */}
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 shadow-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-2">PNR Enquiry Search</h3>
                        <p className="text-xs opacity-50 mb-4">Enter your 10-digit reservation PNR number to check live confirmation states</p>

                        <form onSubmit={handlePnrSearchSubmit} className="flex gap-3">
                            <input
                                type="text"
                                maxLength="10"
                                placeholder="Enter 10-digit PNR Number (e.g. 482930219)"
                                value={searchPnr}
                                onChange={(e) => setSearchPnr(e.target.value.replace(/\D/g, ''))}
                                className={`flex-1 text-xs rounded-xl px-3.5 py-3 focus:ring-1 focus:outline-none ${
                                    highContrast
                                        ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                }`}
                            />
                            <button
                                type="submit"
                                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all shadow-md ${
                                    highContrast
                                        ? 'bg-yellow-400 text-black border-2 border-yellow-400 font-extrabold'
                                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                                }`}
                            >
                                Check PNR ➔
                            </button>
                        </form>
                    </div>

                    {/* Upcoming journey slide/cards */}
                    <div className="space-y-4">
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Upcoming Journeys</h3>

                        {upcoming.length === 0 ? (
                            <div className={`p-8 rounded-3xl border text-center ${
                                highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                            }`}>
                                <p className="text-xs opacity-60">No upcoming journeys scheduled. Plan your next trip on the home page.</p>
                                <Link
                                    href="/"
                                    className="text-xs font-bold text-orange-400 hover:underline mt-2 inline-block"
                                >
                                    Book Tickets Now ➔
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcoming.map(trip => (
                                    <div 
                                        key={trip.id}
                                        className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                                            highContrast 
                                                ? 'border-yellow-400 bg-black text-yellow-300' 
                                                : 'bg-slate-900/30 border-slate-850 hover:border-slate-800'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-extrabold text-sm text-slate-100">{trip.train?.name}</span>
                                                    <span className="text-[10px] font-mono opacity-50 block mt-0.5">#{trip.train?.train_number} • Class: {trip.class_type}</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-orange-400">{trip.pnr}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs opacity-75 mt-4 font-semibold">
                                                <span>{trip.source_station?.code} ➔ {trip.destination_station?.code}</span>
                                                <span className="text-emerald-400">{new Date(trip.journey_date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/bookings/${trip.pnr}`}
                                            className={`w-full py-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                                                highContrast
                                                    ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                                                    : 'border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-slate-100'
                                            }`}
                                        >
                                            View Ticket Details ➔
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All bookings history list */}
                    <div className="space-y-4">
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">All Booking History</h3>
                        
                        <div className="space-y-3.5">
                            {bookings.length === 0 ? (
                                <div className={`p-8 rounded-3xl border text-center ${
                                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                                }`}>
                                    <p className="text-xs opacity-60">No transaction logs available.</p>
                                </div>
                            ) : (
                                bookings.map(item => (
                                    <div 
                                        key={item.id}
                                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                                            highContrast 
                                                ? 'border-yellow-400 bg-black text-yellow-300' 
                                                : 'bg-slate-900/15 border-slate-900/70 hover:border-slate-850'
                                        }`}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className="text-2xl">🎫</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-200 text-xs">{item.train?.name}</span>
                                                    <span className="text-[10px] font-mono opacity-50">PNR: {item.pnr}</span>
                                                </div>
                                                <span className="text-[10px] opacity-45 block mt-1 font-semibold">
                                                    {item.source_station?.code} ➔ {item.destination_station?.code} • {new Date(item.journey_date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between sm:justify-end items-center gap-6">
                                            <div className="text-left sm:text-right">
                                                <span className="text-xs font-bold text-slate-200 block">₹{item.total_fare}</span>
                                                <span className={`text-[9px] font-bold uppercase block mt-0.5 ${
                                                    item.status === 'Cancelled' ? 'text-rose-500' : item.status === 'Partial' ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/bookings/${item.pnr}`}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                                    highContrast
                                                        ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black font-bold'
                                                        : 'border-slate-850 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Notifications alerts panel */}
                <div className={`p-6 rounded-3xl border lg:col-span-4 ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/50 border-slate-850'
                }`}>
                    <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Recent Alerts</h3>

                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2 divide-y divide-slate-850/40">
                        {notifications.length === 0 ? (
                            <div className="text-center py-6 text-xs opacity-50">No notifications on record</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="pt-3 first:pt-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`text-xs font-bold text-slate-200 ${n.type === 'SOS' ? 'text-rose-500 font-extrabold animate-pulse' : ''}`}>
                                            {n.title}
                                        </span>
                                        <span className="text-[9px] opacity-40">
                                            {new Date(n.created_at).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                                        </span>
                                    </div>
                                    <p className="text-[11px] opacity-70 mt-1 leading-relaxed">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
