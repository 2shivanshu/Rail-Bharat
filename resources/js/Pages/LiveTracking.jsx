import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function LiveTracking(props) {
    const { schedule, delay, routes = [], tracking } = props;

    // Accessibility Context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    // Determine color codes for progress visualizer
    const getTimelineColorClasses = (stopNum, idx) => {
        if (tracking.status === 'Completed') return 'bg-emerald-500 border-emerald-500';
        if (tracking.status === 'Not Started') return 'bg-slate-800 border-slate-700';

        // Check if train is currently at this station
        if (tracking.status === 'At Station' && tracking.current_station_id === routes[idx].station_id) {
            return 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/30 animate-pulseScale';
        }

        // Check if stop is passed
        // Find route index of current station
        const currentIdx = routes.findIndex(r => r.station_id === tracking.current_station_id);

        if (currentIdx !== -1) {
            if (idx < currentIdx) {
                return 'bg-emerald-500 border-emerald-500';
            } else if (idx === currentIdx && tracking.status === 'In Transit') {
                return 'bg-emerald-500 border-emerald-500';
            }
        }
        return 'bg-slate-800 border-slate-700';
    };

    return (
        <AuthenticatedLayout header={`Live Tracking: ${schedule.train?.name}`}>
            <Head title="Live Tracking - Rail-Bharat" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Status Summary and Live Map Panel */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Status banner */}
                    <div className={`p-6 rounded-3xl border relative overflow-hidden ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        {/* Indian Flag Strip */}
                        <div className="absolute top-0 inset-x-0 h-1 flex">
                            <div className="flex-1 bg-orange-500"></div>
                            <div className="flex-1 bg-white"></div>
                            <div className="flex-1 bg-emerald-500"></div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                    Train #{schedule.train?.train_number} • {schedule.train?.type}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-100 mt-1">
                                    {schedule.train?.name}
                                </h3>
                                <span className="text-xs text-slate-400 block mt-1">
                                    Journey Date: {new Date(schedule.departure_date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="flex flex-col items-start sm:items-end">
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Status</span>
                                <span className={`text-sm font-extrabold px-3 py-1 rounded-xl mt-1 border uppercase ${
                                    tracking.status === 'Completed'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                        : tracking.status === 'In Transit'
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/25 animate-pulse'
                                        : tracking.status === 'At Station'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                    {tracking.status}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar simulation */}
                        <div className="mt-8">
                            <div className="flex justify-between text-[10px] font-bold opacity-60 mb-2">
                                <span>{routes[0]?.station_code} (Start)</span>
                                <span>{tracking.current_position}% Route Completed</span>
                                <span>{routes[routes.length - 1]?.station_code} (End)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-900 overflow-hidden relative">
                                <div
                                    className={`h-full transition-all duration-1000 ${
                                        highContrast ? 'bg-yellow-400' : 'bg-gradient-to-r from-orange-500 to-emerald-500'
                                    }`}
                                    style={{ width: `${tracking.current_position}%` }}
                                ></div>
                                {/* Train Pin */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 border-2 border-orange-500 flex items-center justify-center text-xs shadow-md transition-all duration-1000"
                                    style={{ left: `calc(${tracking.current_position}% - 12px)` }}
                                >
                                    🚂
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delay & details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 rounded-3xl border flex flex-col justify-center ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                        }`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Delay Status</span>
                            {delay > 0 ? (
                                <h4 className="text-xl font-extrabold text-rose-500 mt-1">⚠️ Delayed by {delay} mins</h4>
                            ) : (
                                <h4 className="text-xl font-extrabold text-emerald-400 mt-1">✓ Running On Time</h4>
                            )}
                            <p className="text-[11px] opacity-50 mt-1">Simulated delays are configured by administrators in the backend panel.</p>
                        </div>

                        <div className={`p-6 rounded-3xl border flex flex-col justify-center ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                        }`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">GPS Simulator Statistics</span>
                            <h4 className="text-sm font-extrabold text-slate-100 mt-1">
                                {tracking.status === 'In Transit'
                                    ? `In Transit towards Next Stop (Progress: ${Math.round(tracking.transit_progress)}%)`
                                    : tracking.status === 'At Station'
                                    ? 'Standing at Station Stop platform'
                                    : tracking.status === 'Completed'
                                    ? 'Journey fully completed'
                                    : 'Awaiting departure schedule'}
                            </h4>
                            <span className="text-[10px] opacity-40 block mt-1">
                                Last Updated: {new Date(tracking.last_updated).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Route Map / List timeline */}
                <div className="lg:col-span-4">
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-xs uppercase tracking-wider mb-6 border-b border-slate-800 pb-2">
                            Train Station Route Timeline
                        </h3>

                        <div className="relative pl-6 border-l-2 border-slate-850/80 space-y-8">
                            {routes.map((route, idx) => {
                                const isCurrent = tracking.status === 'At Station' && tracking.current_station_id === route.station_id;
                                const isNext = tracking.status === 'In Transit' && tracking.next_station_id === route.station_id;

                                return (
                                    <div key={route.route_id} className="relative">
                                        {/* Dot Indicator */}
                                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            getTimelineColorClasses(route.stop_number, idx)
                                        }`}>
                                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`text-xs font-bold ${
                                                    isCurrent ? 'text-orange-400 font-extrabold' : isNext ? 'text-slate-100 underline decoration-dotted' : 'text-slate-200'
                                                }`}>
                                                    {route.station_name}
                                                </h4>
                                                <span className="text-[9px] font-mono opacity-50 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                                                    {route.station_code}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] opacity-60">
                                                <span>Arr: {route.scheduled_arrival || 'Start'}</span>
                                                <span>Dep: {route.scheduled_departure || 'End'}</span>
                                            </div>

                                            {delay > 0 && (
                                                <div className="text-[9px] font-semibold text-rose-455">
                                                    Adj: Arr {route.actual_arrival || 'Start'} • Dep {route.actual_departure || 'End'}
                                                </div>
                                            )}

                                            <span className="text-[9px] opacity-40 block">
                                                Stop {route.stop_number} • {route.distance} km from source
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
