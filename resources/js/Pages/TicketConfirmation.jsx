import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function TicketConfirmation({ booking }) {
    // Accessibility Context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    // Cancellation check list
    const [selectedPassengers, setSelectedPassengers] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const togglePassengerSelection = (id) => {
        if (selectedPassengers.includes(id)) {
            setSelectedPassengers(selectedPassengers.filter(item => item !== id));
        } else {
            setSelectedPassengers([...selectedPassengers, id]);
        }
    };

    // Calculate Estimated Refund
    const calculateEstimatedRefund = () => {
        if (selectedPassengers.length === 0) return 0;

        const depTime = booking.train?.source_departure || '00:00:00';
        const depDateTime = new Date(`${booking.journey_date}T${depTime}`);
        const hoursLeft = (depDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

        let refundPercent = 0;
        if (hoursLeft > 48) {
            refundPercent = 0.80; // 80% refund
        } else if (hoursLeft >= 12) {
            refundPercent = 0.50; // 50% refund
        } else {
            refundPercent = 0.00; // 0% refund
        }

        const farePerPassenger = booking.total_fare / booking.passengers.length;
        const baseEstimate = selectedPassengers.length * farePerPassenger * refundPercent;
        
        return Math.round(baseEstimate * 100) / 100;
    };

    // Handle ticket cancellation post call
    const handleCancelTickets = () => {
        if (selectedPassengers.length === 0) return;

        router.post(route('booking.cancel', booking.id), {
            passengers: selectedPassengers
        }, {
            onSuccess: () => {
                setShowCancelModal(false);
                setSelectedPassengers([]);
            }
        });
    };

    // Helper to get berth type label
    const getBerthType = (seatNo, classType) => {
        if (!seatNo) return 'N/A';
        if (classType === 'SL' || classType === '3A') {
            const mod = seatNo % 8;
            if (mod === 1 || mod === 4) return 'Lower';
            if (mod === 2 || mod === 5) return 'Middle';
            if (mod === 3 || mod === 6) return 'Upper';
            if (mod === 7) return 'Side Lower';
            return 'Side Upper';
        } else if (classType === '2A') {
            const mod = seatNo % 6;
            if (mod === 1 || mod === 3) return 'Lower';
            if (mod === 2 || mod === 4) return 'Upper';
            if (mod === 5) return 'Side Lower';
            return 'Side Upper';
        } else if (classType === '1A') {
            return (seatNo % 2 === 1) ? 'Lower' : 'Upper';
        } else if (classType === 'CC') {
            const mod = seatNo % 6;
            if (mod === 1 || mod === 0) return 'Window';
            if (mod === 2 || mod === 5) return 'Aisle';
            return 'Middle';
        }
        return 'Lower';
    };

    // Printable Page CSS Injection
    const triggerPrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout header="PNR enquiry & E-Ticket Details">
            <Head title={`Ticket PNR ${booking.pnr}`} />

            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    nav, footer, header, button, .no-print {
                        display: none !important;
                    }
                    .print-card {
                        border: 1px solid #ccc !important;
                        background: white !important;
                        color: black !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        width: 100% !important;
                    }
                }
            `}</style>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Ticket card */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Main e-Ticket sheet */}
                    <div className={`p-8 rounded-3xl border print-card shadow-2xl relative overflow-hidden ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/60 border-slate-850 backdrop-blur-md'
                    }`}>
                        {/* Stamp Badge */}
                        <div className="absolute top-6 right-8 text-right z-10 no-print">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border tracking-wide inline-block uppercase ${
                                booking.status === 'Cancelled'
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                                    : booking.status === 'Partial'
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                            }`}>
                                {booking.status === 'Booked' ? 'Confirmed ✅' : booking.status}
                            </span>
                        </div>

                        {/* Title header */}
                        <div className="flex justify-between items-center border-b border-slate-850 pb-6 mb-6">
                            <div>
                                <span className="text-xs uppercase tracking-widest opacity-60 font-bold">E-Ticket / Reservation Receipt</span>
                                <h3 className="font-extrabold text-xl text-slate-100 mt-1">Ministry of Railways</h3>
                                <p className="text-[10px] opacity-40 mt-0.5">Rail-Bharat Electronic Booking System</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase opacity-50 block">PNR Number</span>
                                <span className="font-extrabold text-lg text-slate-100 font-mono tracking-wider">{booking.pnr}</span>
                            </div>
                        </div>

                        {/* Journey Station grid */}
                        <div className="grid grid-cols-3 items-center py-4 bg-slate-950/40 border border-slate-900 rounded-2xl px-6 mb-6">
                            <div>
                                <span className="text-[10px] opacity-50 uppercase block">Departure</span>
                                <strong className="text-sm text-slate-200 mt-1 block">{booking.source_station?.name}</strong>
                                <span className="text-xs opacity-60 font-mono">({booking.source_station?.code})</span>
                                <span className="text-[10px] opacity-40 block mt-1">Departs: {booking.train?.source_departure?.substring(0, 5)}</span>
                            </div>

                            <div className="text-center relative">
                                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest block font-mono">{booking.class_type} Class</span>
                                <div className="h-0.5 bg-slate-800 my-2 relative">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 absolute left-0 -top-0.5"></div>
                                    <span className="text-xs absolute left-1/2 -translate-x-1/2 -top-2 bg-slate-900 px-1">🚃</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 absolute right-0 -top-0.5"></div>
                                </div>
                                <span className="text-[9px] opacity-40 block">Journey Date: {new Date(booking.journey_date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] opacity-50 uppercase block">Arrival</span>
                                <strong className="text-sm text-slate-200 mt-1 block">{booking.destination_station?.name}</strong>
                                <span className="text-xs opacity-60 font-mono">({booking.destination_station?.code})</span>
                                <span className="text-[10px] opacity-40 block mt-1">Arrives: {booking.train?.dest_arrival?.substring(0, 5)}</span>
                            </div>
                        </div>

                        {/* Train details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold mb-6">
                            <div>
                                <span className="opacity-50 block text-[9px] uppercase">Train Name</span>
                                <span className="text-slate-200 mt-0.5 block">{booking.train?.name}</span>
                            </div>
                            <div>
                                <span className="opacity-50 block text-[9px] uppercase">Train Number</span>
                                <span className="text-slate-200 mt-0.5 block font-mono">#{booking.train?.train_number}</span>
                            </div>
                            <div>
                                <span className="opacity-50 block text-[9px] uppercase">Booking ID</span>
                                <span className="text-slate-200 mt-0.5 block">#RES-{booking.id}</span>
                            </div>
                            <div>
                                <span className="opacity-50 block text-[9px] uppercase">Transaction status</span>
                                <span className="text-emerald-400 mt-0.5 block font-bold">SUCCESS</span>
                            </div>
                        </div>

                        {/* Passengers listing table */}
                        <div className="space-y-3.5">
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">Passenger Information</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-slate-850 opacity-60 text-[10px] uppercase font-bold text-slate-400">
                                            <th className="pb-2">Name</th>
                                            <th className="pb-2">Age / Gender</th>
                                            <th className="pb-2">Berth Pref</th>
                                            <th className="pb-2 text-right">Seat Assignment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850/60 font-semibold">
                                        {booking.passengers?.map((passenger, idx) => (
                                            <tr key={passenger.id} className={passenger.status === 'CANCELLED' ? 'opacity-40 line-through text-rose-500' : ''}>
                                                <td className="py-3 pr-2">
                                                    {passenger.name}
                                                </td>
                                                <td className="py-3">
                                                    {passenger.age} / {passenger.gender}
                                                </td>
                                                <td className="py-3">
                                                    {passenger.berth_preference || 'No Pref'}
                                                </td>
                                                <td className="py-3 text-right font-mono">
                                                    {passenger.status === 'CNF' && (
                                                        <span className="text-emerald-400 font-bold">
                                                            CNF • {passenger.coach_number}, Seat {passenger.seat_number} ({getBerthType(passenger.seat_number, booking.class_type)})
                                                        </span>
                                                    )}
                                                    {passenger.status === 'RAC' && (
                                                        <span className="text-amber-400 font-bold">
                                                            RAC • Seat {passenger.seat_number} (Split Berth)
                                                        </span>
                                                    )}
                                                    {passenger.status === 'WL' && (
                                                        <span className="text-rose-400 font-bold">
                                                            WL - {passenger.wl_number}
                                                        </span>
                                                    )}
                                                    {passenger.status === 'CANCELLED' && (
                                                        <span className="text-rose-600 font-bold uppercase">
                                                            Cancelled
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment summary footer */}
                        <div className="border-t border-slate-850 mt-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                            <div className="opacity-60">
                                Simulated payment using UPI • Transaction ID: {booking.payment?.transaction_id}
                            </div>
                            <div className="text-sm font-extrabold text-slate-200">
                                Total Paid: <span className="text-orange-400">₹{booking.total_fare}</span>
                            </div>
                        </div>
                    </div>

                    {/* Print control */}
                    <button
                        onClick={triggerPrint}
                        className={`w-full py-3 rounded-2xl border font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 no-print ${
                            highContrast
                                ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                                : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900/60'
                        }`}
                    >
                        🖨️ Print E-Ticket / Save PDF Receipt
                    </button>
                </div>

                {/* Right Panel: Cancellation Sheet */}
                {booking.status !== 'Cancelled' && (
                    <div className="lg:col-span-4 space-y-6 no-print">
                        <div className={`p-6 rounded-3xl border shadow-xl ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/50 border-slate-850 backdrop-blur-md'
                        }`}>
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-3.5 border-b border-slate-800 pb-2">Cancel Tickets</h3>
                            
                            <p className="text-[11px] opacity-50 mb-4 leading-relaxed">
                                Select passengers to cancel. Refund percentage is calculated dynamically based on time left before train departure.
                            </p>

                            <div className="space-y-3 mb-6">
                                {booking.passengers?.filter(p => p.status !== 'CANCELLED').map(p => (
                                    <div 
                                        key={p.id} 
                                        onClick={() => togglePassengerSelection(p.id)}
                                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                                            selectedPassengers.includes(p.id)
                                                ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400 font-bold' : 'bg-orange-500/10 border-orange-500/40 text-orange-400')
                                                : (highContrast ? 'border-yellow-400 text-yellow-300' : 'border-slate-850 hover:border-slate-800')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedPassengers.includes(p.id)}
                                                onChange={() => {}} // toggled by card click
                                                className="rounded bg-transparent border-slate-700 text-orange-500 focus:ring-0"
                                            />
                                            <div>
                                                <div className="text-xs font-bold text-slate-200">{p.name}</div>
                                                <div className="text-[10px] opacity-50 mt-0.5">{p.status} {p.coach_number ? `(${p.coach_number}, Seat ${p.seat_number})` : ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedPassengers.length > 0 && (
                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 text-xs font-semibold space-y-2 mb-6">
                                    <div className="flex justify-between text-[10px] opacity-60">
                                        <span>Selected Passengers</span>
                                        <span>{selectedPassengers.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                                        <span>Estimated Refund</span>
                                        <span className="text-emerald-400">₹{calculateEstimatedRefund().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={selectedPassengers.length === 0}
                                onClick={() => setShowCancelModal(true)}
                                className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-md transition-all ${
                                    selectedPassengers.length === 0
                                        ? 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10'
                                }`}
                            >
                                Request Cancellation ➔
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Cancel Alert Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-sm rounded-3xl border p-6 text-center ${
                        highContrast ? 'bg-black border-2 border-yellow-400 text-yellow-300' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}>
                        <div className="text-3xl mb-3">⚠️</div>
                        <h3 className="font-bold text-base text-slate-100">Confirm Ticket Cancellation?</h3>
                        <p className="text-xs opacity-60 mt-1.5 leading-relaxed">
                            Are you sure you want to cancel the selected tickets? This action is irreversible. A refund of <strong className="text-emerald-400">₹{calculateEstimatedRefund().toFixed(2)}</strong> will be credited back to your account.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-bold uppercase transition-all"
                            >
                                No, Keep Ticket
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelTickets}
                                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase shadow-lg shadow-rose-600/10 transition-all"
                            >
                                Yes, Cancel ➔
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
