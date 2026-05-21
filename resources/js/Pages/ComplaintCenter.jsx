import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function ComplaintCenter({ complaints = [], bookings = [], notifications = [] }) {
    // Accessibility Settings
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    // Tabs control
    const [activeTab, setActiveTab] = useState('submit');
    const [sosProcessing, setSosProcessing] = useState(false);

    // Complaint Form
    const { data, setData, post, processing, errors, reset } = useForm({
        booking_id: '',
        category: 'Cleanliness',
        subject: '',
        description: '',
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (!data.subject.trim()) {
            alert("Please enter a subject.");
            return;
        }
        if (!data.description.trim()) {
            alert("Please enter details describing the complaint.");
            return;
        }

        post(route('complaints.store'), {
            onSuccess: () => {
                reset();
                setActiveTab('track');
            }
        });
    };

    // SOS Emergency Trigger
    const triggerSOS = () => {
        const confirmSOS = window.confirm("🚨 EMERGENCY WARNING: This will broadcast an active SOS alert to the RPF Security Control Room with your current location coordinates. Only trigger this in case of actual security threat or medical emergency. Proceed?");
        if (!confirmSOS) return;

        setSosProcessing(true);

        // Geolocation simulation or capture
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    sendSosPost(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    // Fallback to NDLS coordinates if permission denied
                    console.warn("Location permission denied. Broadcasting fallback NDLS station location.");
                    sendSosPost(28.6430, 77.2223, "VPA Location broadcast fallback.");
                }
            );
        } else {
            sendSosPost(28.6430, 77.2223);
        }
    };

    const sendSosPost = (lat, lng, extra = '') => {
        router.post(route('complaints.sos'), {
            booking_id: bookings[0]?.id || null, // defaults to latest booking if exists
            latitude: lat,
            longitude: lng,
            details: "SOS panic triggered from web client dashboard. " + extra
        }, {
            onFinish: () => {
                setSosProcessing(false);
                setActiveTab('track');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Help, SOS Assistance & Complaint Center">
            <Head title="Grievance Portal - Rail-Bharat" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Grievance submission/tracking */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Tab Navigation buttons */}
                    <div className="flex gap-2 border-b border-slate-850 pb-px">
                        <button
                            type="button"
                            onClick={() => setActiveTab('submit')}
                            className={`px-5 py-2.5 font-bold text-xs uppercase border-b-2 tracking-wider transition-all ${
                                activeTab === 'submit'
                                    ? (highContrast ? 'border-yellow-400 text-yellow-300' : 'border-orange-500 text-orange-400')
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Submit Grievance
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('track')}
                            className={`px-5 py-2.5 font-bold text-xs uppercase border-b-2 tracking-wider transition-all ${
                                activeTab === 'track'
                                    ? (highContrast ? 'border-yellow-400 text-yellow-300' : 'border-orange-500 text-orange-400')
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Track Grievances ({complaints.length})
                        </button>
                    </div>

                    {/* Tab 1: Submit Form */}
                    {activeTab === 'submit' && (
                        <form onSubmit={handleFormSubmit} className={`p-8 rounded-3xl border space-y-6 ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-850 shadow-xl'
                        }`}>
                            <div className="border-b border-slate-850 pb-4 mb-4">
                                <h3 className="text-lg font-bold text-slate-100">Grievance Submission Form</h3>
                                <p className="text-xs text-slate-400 mt-1">Fill out the details below. Our support agents respond within 15 minutes.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Booking Link */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Link to Ticket (Optional)</label>
                                    <select
                                        value={data.booking_id}
                                        onChange={(e) => setData('booking_id', e.target.value)}
                                        className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                            highContrast
                                                ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                        }`}
                                    >
                                        <option value="">Do not link to ticket</option>
                                        {bookings.map(bk => (
                                            <option key={bk.id} value={bk.id}>
                                                PNR: {bk.pnr} ({bk.train?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Grievance Category</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                            highContrast
                                                ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                        }`}
                                    >
                                        <option value="Cleanliness">Cleanliness (Coach/Toilet)</option>
                                        <option value="Catering">Catering / Food Quality</option>
                                        <option value="Electrical">Electrical (Fan/AC/Charging)</option>
                                        <option value="Staff Behavior">Staff Behavior</option>
                                        <option value="Punctuality">Train Delay / Punctuality</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Brief summary of your grievance (e.g. Charging socket not working in S3 Coach)"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                        highContrast
                                            ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                            : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                    }`}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Detailed Description</label>
                                <textarea
                                    rows="5"
                                    required
                                    placeholder="Provide detailed description. Mention coach details, seat number, and station details if relevant."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                        highContrast
                                            ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                            : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                    }`}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 ${
                                    highContrast
                                        ? 'bg-yellow-400 text-black border-2 border-yellow-400 font-extrabold'
                                        : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/10'
                                }`}
                            >
                                {processing ? 'Submitting...' : 'Register Complaint ➔'}
                            </button>
                        </form>
                    )}

                    {/* Tab 2: Track History */}
                    {activeTab === 'track' && (
                        <div className="space-y-4">
                            {complaints.length === 0 ? (
                                <div className={`p-12 rounded-3xl border text-center ${
                                    highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/10 border-slate-900'
                                }`}>
                                    <div className="text-3xl">📝</div>
                                    <h3 className="text-base font-bold mt-2">No complaints filed yet</h3>
                                    <p className="text-xs opacity-60 mt-1">If you experience issues during your journey, file a complaint using the form.</p>
                                </div>
                            ) : (
                                complaints.map(c => (
                                    <div 
                                        key={c.id} 
                                        className={`p-6 rounded-3xl border space-y-4 ${
                                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/30 border-slate-850'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-850 pb-3.5">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                                                        c.category === 'SOS' 
                                                            ? 'bg-rose-950/40 text-rose-400 border border-rose-500/20' 
                                                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                                                    }`}>
                                                        {c.category}
                                                    </span>
                                                    <span className="font-extrabold text-sm text-slate-200">
                                                        {c.subject}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] opacity-45 block mt-1.5 font-mono">
                                                    Ticket ID: {c.category === 'SOS' ? `#SOS-${c.id}` : `#C-${c.id}`} • Filed on {new Date(c.created_at).toLocaleString('en-IN', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                                                </span>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                c.status === 'Resolved'
                                                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                                                    : c.status === 'In Progress'
                                                    ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </div>

                                        <p className="text-xs opacity-75 leading-relaxed">{c.description}</p>

                                        {/* Status timeline visual */}
                                        <div className="grid grid-cols-3 text-center text-[10px] font-bold opacity-60 max-w-sm pt-2">
                                            <div className={`flex flex-col items-center gap-1 ${c.status === 'Open' || c.status === 'In Progress' || c.status === 'Resolved' ? 'text-orange-400' : ''}`}>
                                                <span>✓ Registered</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                            </div>
                                            <div className={`flex flex-col items-center gap-1 ${c.status === 'In Progress' || c.status === 'Resolved' ? 'text-orange-400' : ''}`}>
                                                <span>{c.status === 'In Progress' || c.status === 'Resolved' ? '✓ Reviewing' : 'Under Review'}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                            </div>
                                            <div className={`flex flex-col items-center gap-1 ${c.status === 'Resolved' ? 'text-emerald-400' : ''}`}>
                                                <span>Resolved</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                            </div>
                                        </div>

                                        {/* Resolution description */}
                                        {c.status === 'Resolved' && c.resolution_details && (
                                            <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/10 text-xs font-semibold text-slate-200 mt-2">
                                                <span className="text-emerald-400 font-bold uppercase block mb-1">Resolution Response:</span>
                                                {c.resolution_details}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: EMERGENCY SOS Panic Panel */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Glowing RED Panic Card */}
                    <div className="relative rounded-3xl bg-gradient-to-br from-rose-950/80 to-slate-950 border border-rose-500/20 p-6 shadow-2xl backdrop-blur-md overflow-hidden text-center">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-600/20 rounded-full blur-2xl animate-pulse"></div>

                        <div className="text-4xl animate-bounce">🚨</div>
                        <h3 className="text-lg font-black text-rose-500 tracking-wider uppercase mt-3">Emergency SOS Portal</h3>
                        <p className="text-[11px] opacity-60 mt-1 max-w-xs mx-auto leading-relaxed">
                            Need medical help or RPF safety team? Click the button below to broadcast your coordinate-based alarm.
                        </p>

                        <button
                            type="button"
                            disabled={sosProcessing}
                            onClick={triggerSOS}
                            className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all mt-6 animate-pulse ${
                                highContrast
                                    ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/20 active:scale-95'
                            }`}
                        >
                            {sosProcessing ? 'Broadcasting Alert...' : '🔴 Trigger SOS Alert'}
                        </button>
                    </div>

                    {/* Quick Contacts panel */}
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/50 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">RPF & Emergency Helplines</h3>
                        
                        <div className="space-y-4 text-xs font-semibold">
                            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                                <div>
                                    <span className="text-slate-100 block font-bold">RPF Security Control</span>
                                    <span className="text-[10px] opacity-50 block mt-0.5">Emergency Assistance</span>
                                </div>
                                <span className="text-orange-400 font-mono font-black text-sm">182</span>
                            </div>

                            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                                <div>
                                    <span className="text-slate-100 block font-bold">Rail Madad / General</span>
                                    <span className="text-[10px] opacity-50 block mt-0.5">Unified Helpline</span>
                                </div>
                                <span className="text-orange-400 font-mono font-black text-sm">139</span>
                            </div>

                            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                                <div>
                                    <span className="text-slate-100 block font-bold">GRP Police Desk</span>
                                    <span className="text-[10px] opacity-50 block mt-0.5">District Railway Police</span>
                                </div>
                                <span className="text-orange-400 font-mono font-black text-sm">1512</span>
                            </div>

                            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                                <div>
                                    <span className="text-slate-100 block font-bold">Women Helpline</span>
                                    <span className="text-[10px] opacity-50 block mt-0.5">Dedicated Desk</span>
                                </div>
                                <span className="text-orange-400 font-mono font-black text-sm">1091</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
