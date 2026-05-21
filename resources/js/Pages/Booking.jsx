import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function Booking(props) {
    const { train, schedule, class_type, source, destination, fare_per_passenger } = props;

    // Use Accessibility Settings from layout context
    const context = useContext(AccessibilityContext);
    const t = context ? context.t : (k) => k;
    const highContrast = context ? context.highContrast : false;

    // Passengers list state
    const [passengers, setPassengers] = useState([
        { name: '', age: '', gender: 'Male', berth_preference: '' }
    ]);

    // Financial breakdown constants
    const convenienceFee = 11.80; // IRCTC Service Charge
    const gstRate = 0.05; // 5% GST

    // Calculations
    const baseTotal = passengers.length * fare_per_passenger;
    const gstTotal = Math.round((baseTotal * gstRate) * 100) / 100;
    const grandTotal = Math.round((baseTotal + gstTotal + convenienceFee) * 100) / 100;

    // Form submission using Inertia useForm helper
    const { data, setData, post, processing, errors } = useForm({
        train_id: train.id,
        schedule_id: schedule.id,
        class_type: class_type,
        source_station_id: source.id,
        destination_station_id: destination.id,
        passengers: [],
        total_fare: grandTotal,
    });

    const addPassenger = () => {
        if (passengers.length >= 6) {
            alert("Maximum of 6 passengers allowed per booking sheet.");
            return;
        }
        setPassengers([...passengers, { name: '', age: '', gender: 'Male', berth_preference: '' }]);
    };

    const removePassenger = (index) => {
        if (passengers.length === 1) return;
        const list = [...passengers];
        list.splice(index, 1);
        setPassengers(list);
    };

    const handleInputChange = (index, field, value) => {
        const list = [...passengers];
        list[index][field] = value;
        setPassengers(list);
    };

    // Berth preferences options based on Class type
    const getBerthOptions = () => {
        if (class_type === 'SL' || class_type === '3A') {
            return ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
        } else if (class_type === '2A') {
            return ['Lower', 'Upper', 'Side Lower', 'Side Upper'];
        } else if (class_type === '1A') {
            return ['Lower', 'Upper'];
        } else if (class_type === 'CC') {
            return ['Window', 'Aisle', 'Middle'];
        }
        return ['Lower', 'Upper'];
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic client-side checks
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.name.trim()) {
                alert(`Please enter a name for Passenger #${i + 1}`);
                return;
            }
            if (!p.age || p.age < 1 || p.age > 120) {
                alert(`Please enter a valid age (1-120) for Passenger #${i + 1}`);
                return;
            }
        }

        // Sync local passengers state with Inertia form data, then post
        data.passengers = passengers;
        data.total_fare = grandTotal;

        post(route('booking.store'));
    };

    return (
        <AuthenticatedLayout header="Passenger Booking Details">
            <Head title="Book Ticket - Rail-Bharat" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Form: Passengers Details */}
                <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
                    
                    {/* Train Info Banner Card */}
                    <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-lg text-slate-100">{train.name}</span>
                                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-850 border border-slate-750 text-slate-400 font-bold">
                                    #{train.train_number}
                                </span>
                            </div>
                            <p className="text-xs opacity-75 mt-1 font-semibold">
                                From: <strong className="text-slate-200">{source.name}</strong> ➔ To: <strong className="text-slate-200">{destination.name}</strong>
                            </p>
                            <p className="text-[11px] opacity-50 mt-0.5">
                                Travel Class: <span className="text-orange-400 font-bold">{class_type}</span> • Date: {new Date(schedule.departure_date).toLocaleDateString('en-IN', {weekday: 'long', day: 'numeric', month: 'short'})}
                            </p>
                        </div>
                        
                        <div className="text-right">
                            <span className="text-xs opacity-50 font-bold uppercase block">Per Passenger Fare</span>
                            <span className="text-xl font-extrabold text-slate-100">₹{fare_per_passenger}</span>
                        </div>
                    </div>

                    {/* Passenger Inputs list */}
                    <div className="space-y-4">
                        {passengers.map((passenger, index) => (
                            <div 
                                key={index} 
                                className={`p-6 rounded-3xl border relative transition-all ${
                                    highContrast 
                                        ? 'border-yellow-400 bg-black text-yellow-300' 
                                        : 'bg-slate-900/10 border-slate-850 shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-3">
                                    <span className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                                        Passenger #{index + 1}
                                    </span>
                                    {passengers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePassenger(index)}
                                            className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:underline"
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    {/* Name */}
                                    <div className="md:col-span-5 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter passenger name"
                                            value={passenger.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        />
                                    </div>

                                    {/* Age */}
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Age</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="120"
                                            placeholder="Age"
                                            value={passenger.age}
                                            onChange={(e) => handleInputChange(index, 'age', e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Gender</label>
                                        <select
                                            value={passenger.gender}
                                            onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Berth Preference */}
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Berth Preference</label>
                                        <select
                                            value={passenger.berth_preference}
                                            onChange={(e) => handleInputChange(index, 'berth_preference', e.target.value)}
                                            className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:outline-none ${
                                                highContrast
                                                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                    : 'bg-slate-950 border-slate-850 text-slate-200 focus:ring-orange-500'
                                            }`}
                                        >
                                            <option value="">No Preference</option>
                                            {getBerthOptions().map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Passenger Button */}
                        <button
                            type="button"
                            onClick={addPassenger}
                            className={`w-full py-3 rounded-2xl border-2 border-dashed font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                                highContrast
                                    ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                                    : 'border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-200 bg-slate-900/5 hover:bg-slate-900/20'
                            }`}
                        >
                            ➕ Add Another Passenger
                        </button>
                    </div>
                </form>

                {/* Right Panel: Invoice details */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`p-6 rounded-3xl border shadow-xl ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/50 border-slate-850 backdrop-blur-md'
                    }`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Travel Invoice</h3>
                        
                        <div className="space-y-3.5 text-xs font-semibold">
                            <div className="flex justify-between">
                                <span className="opacity-60">Base Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
                                <span className="text-slate-200">₹{baseTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="opacity-60">Convenience Service Fee</span>
                                <span className="text-slate-200">₹{convenienceFee.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="opacity-60">GST (5%)</span>
                                <span className="text-slate-200">₹{gstTotal.toFixed(2)}</span>
                            </div>

                            <div className="h-px bg-slate-850 my-2"></div>

                            <div className="flex justify-between text-sm font-extrabold items-center">
                                <span>Grand Total</span>
                                <span className="text-orange-400 text-base">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Error messages if any */}
                        {errors.error && (
                            <div className="p-3 bg-rose-950/30 text-rose-400 border border-rose-500/20 rounded-xl text-xs mt-4 font-semibold">
                                {errors.error}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs tracking-wider uppercase mt-6 shadow-md transition-all flex items-center justify-center gap-1.5 ${
                                highContrast
                                    ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/10 active:scale-[0.99]'
                            }`}
                        >
                            {processing ? 'Processing...' : 'Proceed to Payment ➔'}
                        </button>

                        <p className="text-[10px] opacity-40 text-center mt-3 leading-relaxed">
                            By clicking proceed, your seats are temporarily locked. You have 5 minutes to complete the payment simulation.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
