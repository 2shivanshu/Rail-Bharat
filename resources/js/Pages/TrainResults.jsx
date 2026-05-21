import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function TrainResults(props) {
    const { trains = [], alternatives = [], source, destination, date, stations = [] } = props;
    const { auth } = props;

    // Use Accessibility Settings from layout context
    const context = useContext(AccessibilityContext);
    const t = context ? context.t : (k) => k;
    const highContrast = context ? context.highContrast : false;
    const locale = context ? context.locale : 'en';

    // Filters state
    const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    // Modal state for route map
    const [selectedTrainForRoute, setSelectedTrainForRoute] = useState(null);
    const [routeMapData, setRouteMapData] = useState([]);
    const [loadingRoute, setLoadingRoute] = useState(false);

    // Fetch and show route map timeline
    const handleViewRoute = async (train) => {
        setSelectedTrainForRoute(train);
        setLoadingRoute(true);
        try {
            const res = await fetch(`/trains/${train.id}/route`);
            const data = await res.json();
            setRouteMapData(data);
        } catch (e) {
            console.error("Failed to load route map", e);
        } finally {
            setLoadingRoute(false);
        }
    };

    // Booking click handler
    const handleBookTicket = (train, clsType) => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }

        router.get(route('booking.create'), {
            train_id: train.id,
            schedule_id: train.schedule_id,
            class_type: clsType,
            source: source.code,
            destination: destination.code
        });
    };

    // Filter logic
    const filteredTrains = trains.filter(train => {
        // Filter by Class type
        if (selectedClassFilter !== 'ALL') {
            const hasClass = train.classes.some(c => c.class === selectedClassFilter);
            if (!hasClass) return false;
        }

        // Filter by Train Type
        if (selectedTypeFilter !== 'ALL' && train.type !== selectedTypeFilter) {
            return false;
        }

        // Filter by only available seats (AVBL or RAC)
        if (onlyAvailable) {
            const hasSeats = train.classes.some(c => c.status === 'AVBL' || c.status === 'RAC');
            if (!hasSeats) return false;
        }

        return true;
    });

    const pageContent = (
        <div className="space-y-8">
            {/* Header info bar */}
            <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                highContrast 
                    ? 'border-yellow-400 bg-black text-yellow-300' 
                    : 'bg-slate-900/60 border-slate-850 shadow-xl backdrop-blur-md'
            }`}>
                <div>
                    <span className="text-xs uppercase tracking-wider opacity-60 font-semibold">Search Results</span>
                    <h2 className="text-2xl font-extrabold flex items-center gap-3 mt-1">
                        <span>{source.name}</span>
                        <span className="text-orange-400 font-mono text-xl">➔</span>
                        <span>{destination.name}</span>
                    </h2>
                    <p className="text-xs opacity-75 mt-1 font-semibold">
                        Journey Date: <span className="text-emerald-400">{new Date(date).toLocaleDateString('en-IN', {weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'})}</span> • {trains.length} trains found
                    </p>
                </div>

                {/* Back button */}
                <Link
                    href="/"
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 border self-start md:self-center transition-all ${
                        highContrast
                            ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                            : 'border-slate-800 text-slate-300 bg-slate-950 hover:bg-slate-900'
                    }`}
                >
                    ← Modify Search
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Filters Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Filter Results</h3>
                        
                        {/* Class Filter */}
                        <div className="space-y-2 mb-6">
                            <label className="text-xs opacity-60 font-bold uppercase block">Travel Class</label>
                            <select
                                value={selectedClassFilter}
                                onChange={(e) => setSelectedClassFilter(e.target.value)}
                                className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                    highContrast
                                        ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                }`}
                            >
                                <option value="ALL">All Classes (SL, 3A, 2A, 1A, CC)</option>
                                <option value="SL">Sleeper (SL)</option>
                                <option value="3A">AC 3 Tier (3A)</option>
                                <option value="2A">AC 2 Tier (2A)</option>
                                <option value="1A">AC First Class (1A)</option>
                                <option value="CC">AC Chair Car (CC)</option>
                            </select>
                        </div>

                        {/* Train Type Filter */}
                        <div className="space-y-2 mb-6">
                            <label className="text-xs opacity-60 font-bold uppercase block">Train Type</label>
                            <select
                                value={selectedTypeFilter}
                                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                                className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                    highContrast
                                        ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                }`}
                            >
                                <option value="ALL">All Train Types</option>
                                <option value="Rajdhani">Rajdhani Express</option>
                                <option value="Shatabdi">Shatabdi Express</option>
                                <option value="Superfast">Superfast Mail</option>
                                <option value="Express">Express</option>
                                <option value="Passenger">Passenger</option>
                            </select>
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="onlyAvbl"
                                checked={onlyAvailable}
                                onChange={(e) => setOnlyAvailable(e.target.checked)}
                                className={`rounded focus:ring-0 focus:outline-none ${
                                    highContrast ? 'border-yellow-400 text-black bg-yellow-400' : 'bg-slate-950 border-slate-800 text-orange-500'
                                }`}
                            />
                            <label htmlFor="onlyAvbl" className="text-xs font-semibold cursor-pointer select-none">
                                Only Show Available Seats
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right: Trains list */}
                <div className="lg:col-span-3 space-y-6">
                    {filteredTrains.length === 0 ? (
                        <div className={`p-12 rounded-3xl border text-center ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                        }`}>
                            <div className="text-3xl">🚊</div>
                            <h3 className="text-lg font-bold mt-3">No matching trains found</h3>
                            <p className="text-xs opacity-60 mt-1 max-w-sm mx-auto">Try relaxing your filters or choosing another date/route suggestion.</p>
                        </div>
                    ) : (
                        filteredTrains.map(train => (
                            <div key={train.id} className={`p-6 rounded-3xl border flex flex-col gap-6 transition-all ${
                                highContrast 
                                    ? 'border-yellow-400 bg-black text-yellow-300' 
                                    : 'bg-slate-900/20 border-slate-850 hover:border-slate-800 shadow-lg hover:shadow-xl'
                            }`}>
                                {/* Train name, type, and delay alerts */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-850 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-lg text-slate-100">{train.name}</span>
                                            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                                                #{train.train_number}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                {train.type}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleViewRoute(train)}
                                            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 hover:underline mt-1 block"
                                        >
                                            🗺️ View Time Table & Route Stops
                                        </button>
                                    </div>

                                    {/* Delay Notification Banner */}
                                    {train.schedule_status !== 'Scheduled' && (
                                        <div className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                                            train.schedule_status === 'Cancelled'
                                                ? 'bg-rose-950/30 text-rose-400 border-rose-500/20'
                                                : 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                                        }`}>
                                            <span className="animate-pulse">🚨</span>
                                            <span>
                                                {train.schedule_status === 'Cancelled' 
                                                    ? 'CANCELLED TODAY' 
                                                    : `DELAYED BY ${train.delay_minutes} MINS`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline Departure / Duration / Arrival details */}
                                <div className="grid grid-cols-3 items-center text-center py-2 max-w-xl">
                                    <div className="text-left">
                                        <div className="text-lg font-bold text-slate-100">{train.source_departure.substring(0, 5)}</div>
                                        <div className="text-xs opacity-60 font-semibold mt-0.5">{source.code}</div>
                                        <div className="text-[10px] opacity-40 mt-0.5">{source.name}</div>
                                    </div>

                                    <div className="relative px-4">
                                        <div className="text-[10px] font-semibold opacity-60 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5 inline-block">
                                            {train.duration}
                                        </div>
                                        {/* Visual track line */}
                                        <div className="h-0.5 bg-slate-850 mt-2 flex justify-between items-center relative">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 absolute -left-0.5"></div>
                                            <span className="text-[10px] mx-auto z-10 bg-slate-950 px-1">🚃</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 absolute -right-0.5"></div>
                                        </div>
                                        <div className="text-[9px] opacity-40 mt-1">{train.distance} km</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold text-slate-100">{train.dest_arrival.substring(0, 5)}</div>
                                        <div className="text-xs opacity-60 font-semibold mt-0.5">{destination.code}</div>
                                        <div className="text-[10px] opacity-40 mt-0.5">{destination.name}</div>
                                    </div>
                                </div>

                                {/* Class availability Selector Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-2">
                                    {train.classes.map(cls => {
                                        const isNA = cls.status === 'NA';
                                        const isAvbl = cls.status === 'AVBL';
                                        const isRac = cls.status === 'RAC';
                                        const isWl = cls.status === 'WL';

                                        // Styling based on availability status
                                        let cardStyle = '';
                                        let statusColor = '';

                                        if (highContrast) {
                                            cardStyle = 'border-2 border-yellow-400';
                                            statusColor = 'text-yellow-300';
                                        } else {
                                            if (isAvbl) {
                                                cardStyle = 'bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400';
                                                statusColor = 'text-emerald-400';
                                            } else if (isRac) {
                                                cardStyle = 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-500/20 hover:border-amber-500/40 text-amber-400';
                                                statusColor = 'text-amber-400';
                                            } else if (isWl) {
                                                cardStyle = 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/20 hover:border-rose-500/40 text-rose-400';
                                                statusColor = 'text-rose-400';
                                            } else {
                                                cardStyle = 'bg-slate-900 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed';
                                                statusColor = 'text-slate-500';
                                            }
                                        }

                                        return (
                                            <button
                                                key={cls.class}
                                                type="button"
                                                disabled={isNA || train.schedule_status === 'Cancelled'}
                                                onClick={() => handleBookTicket(train, cls.class)}
                                                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col group ${cardStyle}`}
                                            >
                                                <div className="font-extrabold text-sm flex justify-between w-full">
                                                    <span>{cls.class}</span>
                                                    <span className="opacity-90">₹{cls.fare}</span>
                                                </div>
                                                <div className={`text-[10px] font-bold mt-2.5 ${statusColor}`}>
                                                    {train.schedule_status === 'Cancelled' ? 'Cancelled' : cls.label}
                                                </div>
                                                
                                                {/* Hover Overlay Booking Tag */}
                                                {!isNA && train.schedule_status !== 'Cancelled' && (
                                                    <span className="absolute bottom-1 right-2 text-[9px] font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Book ➔
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Alternative Train Suggestions on Adjacent Days */}
                    {alternatives.length > 0 && (
                        <div className={`p-6 rounded-3xl border ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                        }`}>
                            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2 flex items-center gap-2 text-slate-200">
                                📅 Alternative Travel Options (Adjacent Days)
                            </h3>
                            <p className="text-xs text-slate-455 mb-4 font-semibold">
                                Can't find seats or trains on your selected date? Check these suggestions within ±2 days:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {alternatives.map((alt, index) => {
                                    const altDateFormatted = new Date(alt.date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    });

                                    return (
                                        <div 
                                            key={index}
                                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 ${
                                                highContrast
                                                    ? 'border-yellow-400 bg-black text-yellow-300'
                                                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 transition-all'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-extrabold text-sm text-slate-200">{alt.name}</h4>
                                                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                                                        #{alt.train_number}
                                                    </span>
                                                </div>
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                                                    {altDateFormatted}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs opacity-80 mt-1">
                                                <div>
                                                    <span className="opacity-50">Departs: </span>
                                                    <span className="font-bold text-slate-350">{alt.departure_time.substring(0, 5)}</span>
                                                </div>
                                                <div>
                                                    <span className="opacity-50">Arrives: </span>
                                                    <span className="font-bold text-slate-350">{alt.arrival_time.substring(0, 5)}</span>
                                                </div>
                                            </div>

                                            <Link
                                                href={route('trains.search')}
                                                data={{
                                                    source: source.code,
                                                    destination: destination.code,
                                                    date: alt.date
                                                }}
                                                className={`w-full py-2.5 rounded-xl font-bold text-xs text-center transition-all ${
                                                    highContrast
                                                        ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                                                        : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-450 border border-orange-500/20 hover:border-orange-500/40'
                                                }`}
                                            >
                                                View Availability for {altDateFormatted} ➔
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Route map details modal */}
            {selectedTrainForRoute && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg rounded-3xl border p-6 overflow-hidden max-h-[85vh] flex flex-col ${
                        highContrast ? 'bg-black border-2 border-yellow-400 text-yellow-300' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-100">
                                    {selectedTrainForRoute.name} ({selectedTrainForRoute.train_number})
                                </h3>
                                <p className="text-xs opacity-60 mt-0.5">Route Timeline & Schedule Stops</p>
                            </div>
                            <button
                                onClick={() => setSelectedTrainForRoute(null)}
                                className={`p-1.5 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-100`}
                            >
                                ✕
                            </button>
                        </div>

                        {loadingRoute ? (
                            <div className="py-12 text-center text-xs opacity-60 animate-pulse">Loading schedule timeline...</div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                <div className="relative pl-6 border-l border-slate-800 ml-4 space-y-6 py-2">
                                    {routeMapData.map((routeItem, idx) => (
                                        <div key={routeItem.id} className="relative">
                                            {/* Node bullet */}
                                            <div className={`absolute -left-[30px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
                                                routeItem.station_id === source.id || routeItem.station_id === destination.id
                                                    ? 'bg-orange-500 border-orange-400'
                                                    : 'bg-slate-900 border-slate-700'
                                            }`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-200 text-sm">
                                                        {routeItem.station?.name}
                                                    </span>
                                                    <span className="text-[10px] font-mono opacity-65 bg-slate-850 px-1.5 py-0.5 rounded">
                                                        {routeItem.station?.code}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-xs opacity-60 mt-1 font-semibold">
                                                    <div>
                                                        {routeItem.stop_number === 1 ? (
                                                            <span>Departs: <strong className="text-slate-300">{routeItem.departure_time.substring(0, 5)}</strong></span>
                                                        ) : !routeItem.departure_time ? (
                                                            <span>Arrives: <strong className="text-slate-300">{routeItem.arrival_time.substring(0, 5)}</strong> (Terminates)</span>
                                                        ) : (
                                                            <span>Arrives: <strong className="text-slate-300">{routeItem.arrival_time.substring(0, 5)}</strong> | Departs: <strong className="text-slate-300">{routeItem.departure_time.substring(0, 5)}</strong></span>
                                                        )}
                                                    </div>
                                                    <span>{routeItem.distance_from_source} km</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // If logged in, wrap in AuthenticatedLayout, else render guest
    if (auth.user) {
        return (
            <AuthenticatedLayout header="Train Availability & Fare search">
                <Head title="Train Search Results" />
                {pageContent}
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Head title="Train Search Results" />
            <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-600">
                            <span className="text-white font-extrabold text-sm">R</span>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-white">RAIL-BHARAT</span>
                    </Link>
                    <Link href={route('login')} className="text-sm font-semibold px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white">
                        Log in to Book
                    </Link>
                </div>
            </header>
            <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {pageContent}
            </main>
        </div>
    );
}
