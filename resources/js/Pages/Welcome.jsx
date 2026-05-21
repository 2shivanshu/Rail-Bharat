import { Link, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth, canLogin, canRegister, stations = [] }) {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });

    const [sourceQuery, setSourceQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [showSourceList, setShowSourceList] = useState(false);
    const [showDestList, setShowDestList] = useState(false);

    // Filters for autocomplete
    const filteredSourceStations = stations.filter(station =>
        station.name.toLowerCase().includes(sourceQuery.toLowerCase()) ||
        station.code.toLowerCase().includes(sourceQuery.toLowerCase())
    );

    const filteredDestStations = stations.filter(station =>
        station.name.toLowerCase().includes(destQuery.toLowerCase()) ||
        station.code.toLowerCase().includes(destQuery.toLowerCase())
    );

    const handleSearch = (e) => {
        e.preventDefault();
        
        if (!source) {
            alert("Please select a valid source station from the dropdown.");
            return;
        }
        if (!destination) {
            alert("Please select a valid destination station from the dropdown.");
            return;
        }
        if (source === destination) {
            alert("Source and Destination stations cannot be the same.");
            return;
        }

        router.get(route('trains.search'), {
            source: source,
            destination: destination,
            date: date
        });
    };

    const handleSelectSource = (station) => {
        setSource(station.code);
        setSourceQuery(`${station.name} (${station.code})`);
        setShowSourceList(false);
    };

    const handleSelectDest = (station) => {
        setDestination(station.code);
        setDestQuery(`${station.name} (${station.code})`);
        setShowDestList(false);
    };

    // Swapping stations helper
    const swapStations = () => {
        const tempCode = source;
        const tempQuery = sourceQuery;

        setSource(destination);
        setSourceQuery(destQuery);
        
        setDestination(tempCode);
        setDestQuery(tempQuery);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
            <Head title="Welcome to Rail-Bharat" />

            {/* Glowing Background Orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Main Header / Navbar */}
            <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/10">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-white to-emerald-400">
                            RAIL-BHARAT
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-sm font-semibold text-slate-300 hover:text-slate-100 transition-all"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-sm font-semibold px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition-all"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero & Booking panel */}
            <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left: Marketing / Intro */}
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-orange-400 animate-pulse">
                        🇮🇳 National Railway Reservation Portal
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                        Journey Across <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-white to-emerald-400">
                            Bharat with Pride
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Experience next-generation high-speed booking, live seat allocation algorithm, integrated RPF safety systems, and instantaneous grievance redressals.
                    </p>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-3 gap-6 pt-4 max-w-md mx-auto lg:mx-0">
                        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900">
                            <div className="text-xl font-bold text-orange-400">100%</div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Seat Lock</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900">
                            <div className="text-xl font-bold text-slate-100">Live</div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Availability</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900">
                            <div className="text-xl font-bold text-emerald-400">Instant</div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Refunds</div>
                        </div>
                    </div>
                </div>

                {/* Right: Booking Form Container */}
                <div className="lg:col-span-6">
                    <div className="relative rounded-3xl bg-slate-900/60 border border-slate-800 p-8 shadow-2xl backdrop-blur-md">
                        
                        {/* Indian Flag Strip */}
                        <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-3xl flex">
                            <div className="flex-1 bg-orange-500"></div>
                            <div className="flex-1 bg-white"></div>
                            <div className="flex-1 bg-emerald-500"></div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-100">Book Train Ticket</h2>
                            <p className="text-xs text-slate-400 mt-1">Select route, check availability & secure tickets instantly</p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-5">
                            
                            {/* Source Autocomplete */}
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">From Station</label>
                                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-2xl px-4 py-3 focus-within:border-orange-500/50 transition-colors">
                                    <span className="text-slate-500 mr-2.5">🛫</span>
                                    <input
                                        type="text"
                                        placeholder="Search station or code (e.g. NDLS)"
                                        value={sourceQuery}
                                        onChange={(e) => {
                                            setSourceQuery(e.target.value);
                                            setShowSourceList(true);
                                            if (e.target.value === '') setSource('');
                                        }}
                                        onFocus={() => setShowSourceList(true)}
                                        className="bg-transparent border-0 p-0 w-full focus:ring-0 focus:outline-none placeholder-slate-600 text-sm font-semibold"
                                    />
                                </div>
                                {showSourceList && sourceQuery.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-850">
                                        {filteredSourceStations.length === 0 ? (
                                            <div className="p-3 text-xs text-slate-500">No stations found</div>
                                        ) : (
                                            filteredSourceStations.map(st => (
                                                <button
                                                    key={st.id}
                                                    type="button"
                                                    onClick={() => handleSelectSource(st)}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 transition-colors flex justify-between"
                                                >
                                                    <span>{st.name}</span>
                                                    <span className="text-orange-400 font-mono">{st.code}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Swap Button */}
                            <div className="flex justify-center -my-3 relative z-10">
                                <button
                                    type="button"
                                    onClick={swapStations}
                                    className="p-2.5 rounded-full bg-slate-850 border border-slate-750 text-slate-300 hover:text-orange-400 hover:border-orange-500/30 active:scale-95 transition-all shadow-md shadow-slate-950"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Destination Autocomplete */}
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">To Station</label>
                                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-2xl px-4 py-3 focus-within:border-orange-500/50 transition-colors">
                                    <span className="text-slate-500 mr-2.5">🛬</span>
                                    <input
                                        type="text"
                                        placeholder="Search station or code (e.g. HWH)"
                                        value={destQuery}
                                        onChange={(e) => {
                                            setDestQuery(e.target.value);
                                            setShowDestList(true);
                                            if (e.target.value === '') setDestination('');
                                        }}
                                        onFocus={() => setShowDestList(true)}
                                        className="bg-transparent border-0 p-0 w-full focus:ring-0 focus:outline-none placeholder-slate-600 text-sm font-semibold"
                                    />
                                </div>
                                {showDestList && destQuery.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-850">
                                        {filteredDestStations.length === 0 ? (
                                            <div className="p-3 text-xs text-slate-500">No stations found</div>
                                        ) : (
                                            filteredDestStations.map(st => (
                                                <button
                                                    key={st.id}
                                                    type="button"
                                                    onClick={() => handleSelectDest(st)}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 transition-colors flex justify-between"
                                                >
                                                    <span>{st.name}</span>
                                                    <span className="text-emerald-400 font-mono">{st.code}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Journey Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Date of Journey</label>
                                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-2xl px-4 py-3 focus-within:border-orange-500/50 transition-colors">
                                    <span className="text-slate-500 mr-2.5">📅</span>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent border-0 p-0 w-full focus:ring-0 focus:outline-none text-slate-100 text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Quick station suggestions */}
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                <span className="text-[10px] text-slate-500 self-center uppercase font-bold mr-1">Popular routes:</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSource('NDLS'); setSourceQuery('New Delhi (NDLS)');
                                        setDestination('HWH'); setDestQuery('Howrah Junction (HWH)');
                                    }}
                                    className="text-[10px] font-bold px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300"
                                >
                                    NDLS ⇌ HWH
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSource('NDLS'); setSourceQuery('New Delhi (NDLS)');
                                        setDestination('SBC'); setDestQuery('KSR Bengaluru (SBC)');
                                    }}
                                    className="text-[10px] font-bold px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300"
                                >
                                    NDLS ⇌ SBC
                                </button>
                            </div>

                            {/* Submit Search */}
                            <button
                                type="submit"
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search Trains
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Accessibility note banner */}
            <div className="bg-slate-900 border-t border-slate-850 py-4">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex justify-center items-center gap-4">
                    <span>🔤 Screen Reader Friendly</span>
                    <span>♿ Keyboard Navigable</span>
                    <span>🌐 Supports Local Languages inside Dashboard</span>
                </div>
            </div>
        </div>
    );
}
