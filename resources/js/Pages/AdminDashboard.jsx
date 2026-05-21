import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function AdminDashboard(props) {
    const { stats, revenue_chart = [], complaints_summary = [], complaints = [], occupancy_heatmap = [], trains = [], stations = [] } = props;

    // Accessibility Context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    // Panels control
    const [activeTab, setActiveTab] = useState('analytics');

    // Complaint Resolution Form State
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionStatus, setResolutionStatus] = useState('Resolved');
    const [resolutionDetails, setResolutionDetails] = useState('');
    const [submittingResolution, setSubmittingResolution] = useState(false);

    // Schedule Delay state
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleStatus, setScheduleStatus] = useState('Scheduled');
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [submittingDelay, setSubmittingDelay] = useState(false);

    // Handle complaint resolution post
    const handleSubmitResolution = (e) => {
        e.preventDefault();
        if (!resolutionDetails.trim()) {
            alert("Please enter resolution remarks.");
            return;
        }
        setSubmittingResolution(true);
        router.post(route('admin.complaints.resolve', selectedComplaint.id), {
            status: resolutionStatus,
            resolution_details: resolutionDetails,
        }, {
            onSuccess: () => {
                setSelectedComplaint(null);
                setResolutionDetails('');
            },
            onFinish: () => setSubmittingResolution(false),
        });
    };

    // Handle schedule delay updates
    const handleSubmitDelay = (e) => {
        e.preventDefault();
        setSubmittingDelay(true);
        router.post(route('admin.schedules.delay', selectedSchedule.schedule_id), {
            status: scheduleStatus,
            delay_minutes: delayMinutes,
        }, {
            onSuccess: () => {
                setSelectedSchedule(null);
            },
            onFinish: () => setSubmittingDelay(false),
        });
    };

    return (
        <AuthenticatedLayout header="Admin Control Panel & Occupancy Analytics">
            <Head title="Admin Dashboard - Rail-Bharat" />

            {/* Admin Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Metric 1 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Active Trains</span>
                        <h4 className="text-3xl font-extrabold text-slate-100 mt-1">{stats.total_trains}</h4>
                    </div>
                    <span className="text-2xl">🚂</span>
                </div>

                {/* Metric 2 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Net Bookings</span>
                        <h4 className="text-3xl font-extrabold text-slate-100 mt-1">{stats.total_bookings}</h4>
                    </div>
                    <span className="text-2xl">🎫</span>
                </div>

                {/* Metric 3 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Revenue (Net)</span>
                        <h4 className="text-3xl font-extrabold text-orange-400 mt-1">₹{stats.total_revenue}</h4>
                    </div>
                    <span className="text-2xl">💰</span>
                </div>

                {/* Metric 4 */}
                <div className={`p-6 rounded-3xl border flex items-center justify-between shadow ${
                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                }`}>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Active Grievances</span>
                        <h4 className="text-3xl font-extrabold text-rose-500 mt-1">{stats.active_complaints}</h4>
                    </div>
                    <span className="text-2xl">🚨</span>
                </div>
            </div>

            {/* Tabs Control bar */}
            <div className="flex gap-2 border-b border-slate-850 pb-px mb-8">
                <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`px-5 py-2.5 font-bold text-xs uppercase border-b-2 tracking-wider transition-all ${
                        activeTab === 'analytics'
                            ? (highContrast ? 'border-yellow-400 text-yellow-300 font-bold' : 'border-orange-500 text-orange-400')
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Occupancy & Financials
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('complaints')}
                    className={`px-5 py-2.5 font-bold text-xs uppercase border-b-2 tracking-wider transition-all ${
                        activeTab === 'complaints'
                            ? (highContrast ? 'border-yellow-400 text-yellow-300 font-bold' : 'border-orange-500 text-orange-400')
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Grievance Center Desk ({complaints.filter(c => c.status !== 'Resolved').length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('schedules')}
                    className={`px-5 py-2.5 font-bold text-xs uppercase border-b-2 tracking-wider transition-all ${
                        activeTab === 'schedules'
                            ? (highContrast ? 'border-yellow-400 text-yellow-300 font-bold' : 'border-orange-500 text-orange-400')
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Schedule Delay Coordinator
                </button>
            </div>

            {/* TAB CONTENT 1: ANALYTICS */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Revenue Bar Graph */}
                    <div className={`p-6 rounded-3xl border lg:col-span-4 ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 shadow-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-6 border-b border-slate-800 pb-2">Revenue Performance</h3>
                        
                        {revenue_chart.length === 0 ? (
                            <div className="py-12 text-center text-xs opacity-60">No payment data yet</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Bar chart UI */}
                                <div className="h-48 flex items-end gap-4 border-b border-slate-800 pb-2.5">
                                    {revenue_chart.map((data, idx) => {
                                        const maxRev = Math.max(...revenue_chart.map(d => d.net_revenue)) || 1;
                                        const pct = (data.net_revenue / maxRev) * 100;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                                <div 
                                                    style={{ height: `${pct}%` }} 
                                                    className="w-full rounded-t-lg bg-gradient-to-t from-orange-600 to-amber-500 min-h-[5px] relative group"
                                                >
                                                    {/* Tooltip */}
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-[10px] px-1.5 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        ₹{data.net_revenue}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold opacity-60 font-mono tracking-tighter truncate max-w-full">{data.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 text-xs font-semibold">
                                    {complaints_summary.map(summary => (
                                        <div key={summary.category} className="flex justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-900">
                                            <span className="opacity-60">{summary.category} Complaints</span>
                                            <span className="text-rose-400 font-bold">{summary.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Occupancy rates heatmap */}
                    <div className={`p-6 rounded-3xl border lg:col-span-8 ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 shadow-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-6 border-b border-slate-800 pb-2">Train Occupancy Analyzer</h3>
                        
                        <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
                            {occupancy_heatmap.map(schedule => {
                                const rate = schedule.occupancy_rate;
                                
                                // Color conditions
                                let barBg = 'bg-rose-600';
                                if (rate >= 75) barBg = 'bg-emerald-500';
                                else if (rate >= 40) barBg = 'bg-amber-500';

                                return (
                                    <div key={schedule.schedule_id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900/60 space-y-3.5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-extrabold text-sm text-slate-100">{schedule.train_name}</span>
                                                <span className="text-[10px] font-mono opacity-50 block mt-0.5">#{schedule.train_number} • Date: {schedule.departure_date}</span>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs font-extrabold text-slate-200">{rate}% Occupied</span>
                                                <span className="text-[9px] opacity-45 block mt-0.5">{schedule.booked_seats} / {schedule.total_capacity} confirmed seats</span>
                                            </div>
                                        </div>

                                        {/* Occupancy bar */}
                                        <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden">
                                            <div style={{ width: `${rate}%` }} className={`h-full rounded-full ${barBg}`}></div>
                                        </div>

                                        {/* Class breakdown indicators */}
                                        <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                                            {Object.entries(schedule.class_occupancy).map(([cls, info]) => (
                                                <span key={cls} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 opacity-80">
                                                    {cls}: {info.booked}/{info.capacity} ({info.rate}%)
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: GRIEVANCE DESK */}
            {activeTab === 'complaints' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Complaints List Table */}
                    <div className={`p-6 rounded-3xl border lg:col-span-7 space-y-4 ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 shadow-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">Active Passenger Grievances</h3>
                        
                        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                            {complaints.length === 0 ? (
                                <div className="py-12 text-center text-xs opacity-60">No grievances recorded yet</div>
                            ) : (
                                complaints.map(c => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => {
                                            setSelectedComplaint(c);
                                            setResolutionStatus(c.status === 'Open' ? 'In Progress' : c.status);
                                            setResolutionDetails(c.resolution_details || '');
                                        }}
                                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                                            selectedComplaint?.id === c.id
                                                ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400 font-bold' : 'bg-orange-500/10 border-orange-500/40 text-orange-400')
                                                : (c.category === 'SOS' 
                                                    ? 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/20' 
                                                    : 'bg-slate-950/50 hover:bg-slate-950 border-slate-900')
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                                                    c.category === 'SOS' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                                                }`}>
                                                    {c.category}
                                                </span>
                                                <span className="font-extrabold text-xs text-slate-200 truncate max-w-xs">{c.subject}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                c.status === 'Resolved' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </div>

                                        <p className="text-[11px] opacity-70 mt-2 truncate leading-relaxed">{c.description}</p>
                                        <span className="text-[9px] opacity-40 block mt-2 font-mono">
                                            By: {c.user?.name} ({c.user?.email}) • Ticket: #{c.id}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Resolution Form card */}
                    <div className="lg:col-span-5">
                        {selectedComplaint ? (
                            <form onSubmit={handleSubmitResolution} className={`p-6 rounded-3xl border space-y-5 ${
                                highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/50 border-slate-850 shadow-xl'
                            }`}>
                                <div className="border-b border-slate-850 pb-3 mb-3 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-100">Grievance Resolver</h3>
                                        <span className="text-[10px] opacity-50 block font-mono">Complaint #{selectedComplaint.id}</span>
                                    </div>
                                    <button type="button" onClick={() => setSelectedComplaint(null)} className="text-xs hover:underline">Cancel</button>
                                </div>

                                <div className="space-y-2 text-xs font-semibold bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                                    <div className="opacity-60 uppercase text-[9px]">Grievance Details</div>
                                    <p className="text-slate-200 mt-1 leading-relaxed">{selectedComplaint.description}</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Status selection */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Update Status</label>
                                        <select
                                            value={resolutionStatus}
                                            onChange={(e) => setResolutionStatus(e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </div>

                                    {/* Resolution Remarks */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Resolution Remarks</label>
                                        <textarea
                                            rows="4"
                                            required
                                            placeholder="Provide resolution details or feedback sent to passenger..."
                                            value={resolutionDetails}
                                            onChange={(e) => setResolutionDetails(e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingResolution}
                                        className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all shadow-md ${
                                            highContrast
                                                ? 'bg-yellow-400 text-black border-2 border-yellow-400 font-extrabold'
                                                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/10'
                                        }`}
                                    >
                                        {submittingResolution ? 'Saving...' : 'Submit Resolution Response ➔'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={`p-12 rounded-3xl border text-center opacity-65 ${
                                highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                            }`}>
                                <div className="text-3xl">👈</div>
                                <h4 className="text-sm font-bold mt-2">Select a passenger grievance</h4>
                                <p className="text-[11px] opacity-50 mt-1">Select any active card on the left to resolve, dispatch teams, or submit response remarks.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: SCHEDULES DELAY COORDINATOR */}
            {activeTab === 'schedules' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Schedules listing */}
                    <div className={`p-6 rounded-3xl border lg:col-span-7 space-y-4 ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 shadow-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">Train Schedules Timeline</h3>
                        
                        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                            {occupancy_heatmap.map(schedule => (
                                <div 
                                    key={schedule.schedule_id}
                                    onClick={() => {
                                        setSelectedSchedule(schedule);
                                        setScheduleStatus(schedule.status);
                                        setDelayMinutes(schedule.delay_minutes || 0);
                                    }}
                                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                                        selectedSchedule?.schedule_id === schedule.schedule_id
                                            ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400 font-bold' : 'bg-orange-500/10 border-orange-500/40 text-orange-400')
                                            : 'bg-slate-950/50 hover:bg-slate-950 border-slate-900'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-sm text-slate-100">{schedule.train_name}</span>
                                            <span className="font-mono text-xs opacity-60">#{schedule.train_number}</span>
                                        </div>
                                        <span className="text-[10px] opacity-45 block mt-1.5 font-mono">
                                            Date: {schedule.departure_date} • Delay: {schedule.delay_minutes} mins
                                        </span>
                                    </div>

                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        schedule.status === 'Cancelled'
                                            ? 'bg-rose-950/40 text-rose-500 border border-rose-500/20 animate-pulse'
                                            : schedule.status === 'Delayed'
                                            ? 'bg-amber-950/40 text-amber-500 border border-amber-500/20'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {schedule.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule Update Form */}
                    <div className="lg:col-span-5">
                        {selectedSchedule ? (
                            <form onSubmit={handleSubmitDelay} className={`p-6 rounded-3xl border space-y-5 ${
                                highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/50 border-slate-850 shadow-xl'
                            }`}>
                                <div className="border-b border-slate-850 pb-3 mb-3 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-100">Schedule Coordinator</h3>
                                        <span className="text-[10px] opacity-50 block font-mono">Train #{selectedSchedule.train_number}</span>
                                    </div>
                                    <button type="button" onClick={() => setSelectedSchedule(null)} className="text-xs hover:underline">Cancel</button>
                                </div>

                                <div className="space-y-4">
                                    {/* Schedule status */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Train Status</label>
                                        <select
                                            value={scheduleStatus}
                                            onChange={(e) => setScheduleStatus(e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Delayed">Delayed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    {/* Delay minutes (shown only if Delayed) */}
                                    {scheduleStatus === 'Delayed' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">Delay (Minutes)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                placeholder="Enter delay in minutes"
                                                value={delayMinutes}
                                                onChange={(e) => setDelayMinutes(e.target.value)}
                                                className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                                    highContrast
                                                        ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                                }`}
                                            />
                                        </div>
                                    )}

                                    {scheduleStatus === 'Cancelled' && (
                                        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs font-semibold text-rose-400">
                                            🚨 WARNING: Marking this train as Cancelled will automatically notify all passengers and process full refunds for all bookings!
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submittingDelay}
                                        className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all shadow-md ${
                                            highContrast
                                                ? 'bg-yellow-400 text-black border-2 border-yellow-400 font-extrabold'
                                                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/10'
                                        }`}
                                    >
                                        {submittingDelay ? 'Updating...' : 'Update Schedule & Alert Passengers ➔'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={`p-12 rounded-3xl border text-center opacity-65 ${
                                highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                            }`}>
                                <div className="text-3xl">👈</div>
                                <h4 className="text-sm font-bold mt-2">Select a train schedule</h4>
                                <p className="text-[11px] opacity-50 mt-1">Select any active schedule on the left to mark it as delayed or cancelled.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
