import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useContext, useEffect } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Booking(props) {
    const { train, schedule, class_type, source, destination, fare_per_passenger } = props;

    // Use Accessibility Settings from layout context
    const context = useContext(AccessibilityContext);
    const t = context ? context.t : (k) => k;
    const highContrast = context ? context.highContrast : false;

    // Passengers list state
    const [passengers, setPassengers] = useState([
        { name: '', age: '', gender: 'Male', berth_preference: '', coach_number: '', seat_number: '' }
    ]);

    // Seat map states
    const [coaches, setCoaches] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState({});
    const [selectedCoach, setSelectedCoach] = useState('');
    const [activePassengerIndex, setActivePassengerIndex] = useState(null);
    const [loadingSeats, setLoadingSeats] = useState(false);

    // Fetch occupied seats
    useEffect(() => {
        setLoadingSeats(true);
        axios.get(route('bookings.occupied-seats'), {
            params: {
                schedule_id: schedule.id,
                class_type: class_type
            }
        })
        .then(res => {
            const data = res.data;
            setCoaches(data.coaches || []);
            setOccupiedSeats(data.occupied || {});
            if (data.coaches && data.coaches.length > 0) {
                setSelectedCoach(data.coaches[0].coach_number);
            }
        })
        .catch(err => {
            console.error("Error fetching seat layout:", err);
        })
        .finally(() => {
            setLoadingSeats(false);
        });
    }, [schedule.id, class_type]);

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
        setPassengers([...passengers, { name: '', age: '', gender: 'Male', berth_preference: '', coach_number: '', seat_number: '' }]);
    };

    const removePassenger = (index) => {
        if (passengers.length === 1) return;
        const list = [...passengers];
        list.splice(index, 1);
        setPassengers(list);
        if (activePassengerIndex === index) {
            setActivePassengerIndex(null);
        } else if (activePassengerIndex > index) {
            setActivePassengerIndex(activePassengerIndex - 1);
        }
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

    // Determine berth type by seat index
    const getBerthType = (seatNo, classType) => {
        if (classType === 'SL' || classType === '3A') {
            const mod = seatNo % 8;
            if (mod === 1 || mod === 4) return 'Lower';
            if (mod === 2 || mod === 5) return 'Middle';
            if (mod === 3 || mod === 6) return 'Upper';
            if (mod === 7) return 'Side Lower';
            return 'Side Upper'; // 0
        } else if (classType === '2A') {
            const mod = seatNo % 6;
            if (mod === 1 || mod === 3) return 'Lower';
            if (mod === 2 || mod === 4) return 'Upper';
            if (mod === 5) return 'Side Lower';
            return 'Side Upper'; // 0
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

    const handleSeatClick = (coachNum, seatNo) => {
        if (activePassengerIndex === null) {
            alert("Please select a passenger tab first to assign this seat.");
            return;
        }

        // Check if this seat is already assigned to another passenger in our list
        const duplicateIndex = passengers.findIndex((p, idx) => 
            idx !== activePassengerIndex && p.coach_number === coachNum && p.seat_number === seatNo
        );
        if (duplicateIndex !== -1) {
            alert(`This seat is already selected for Passenger #${duplicateIndex + 1}.`);
            return;
        }

        const list = [...passengers];
        list[activePassengerIndex].coach_number = coachNum;
        list[activePassengerIndex].seat_number = seatNo;
        list[activePassengerIndex].berth_preference = getBerthType(seatNo, class_type);
        setPassengers(list);
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

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

    const renderSeatButton = (seatNo) => {
        const type = getBerthType(seatNo, class_type);
        const typeAbbr = type.split(' ').map(w => w[0]).join('');
        const isOccupied = occupiedSeats[selectedCoach]?.includes(seatNo);
        
        const isActiveSelected = activePassengerIndex !== null && 
            passengers[activePassengerIndex]?.coach_number === selectedCoach && 
            passengers[activePassengerIndex]?.seat_number === seatNo;
            
        const otherPassengerIndex = passengers.findIndex((p, idx) => 
            idx !== activePassengerIndex && p.coach_number === selectedCoach && p.seat_number === seatNo
        );
        const isOtherSelected = otherPassengerIndex !== -1;

        let btnClass = "";
        let statusText = "";

        if (isOccupied) {
            btnClass = highContrast
                ? "border-2 border-red-600 bg-black text-red-500 cursor-not-allowed opacity-50"
                : "bg-rose-950/40 border border-rose-900/60 text-rose-500/80 cursor-not-allowed";
            statusText = "Occupied";
        } else if (isActiveSelected) {
            btnClass = highContrast
                ? "border-4 border-yellow-400 bg-yellow-400 text-black font-extrabold"
                : "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 font-bold scale-[1.03] shadow-md shadow-emerald-500/10";
            statusText = `P${activePassengerIndex + 1}`;
        } else if (isOtherSelected) {
            btnClass = highContrast
                ? "border-2 border-blue-500 bg-black text-blue-400"
                : "bg-blue-950/50 border border-blue-700/80 text-blue-300 font-semibold";
            statusText = `P${otherPassengerIndex + 1}`;
        } else {
            btnClass = highContrast
                ? "border-2 border-yellow-400 bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-slate-100";
        }

        return (
            <button
                key={seatNo}
                type="button"
                disabled={isOccupied}
                onClick={() => handleSeatClick(selectedCoach, seatNo)}
                className={`px-2 py-3.5 rounded-xl text-center flex flex-col justify-center items-center gap-0.5 transition-all text-[11px] min-w-[50px] ${btnClass}`}
                title={`Seat ${seatNo} - ${type} (${statusText || 'Available'})`}
            >
                <span className="font-extrabold text-[12px]">{seatNo}</span>
                <span className="opacity-60 text-[9px] uppercase font-bold tracking-wider">{typeAbbr}</span>
                {statusText && <span className="text-[8px] mt-0.5 font-bold uppercase tracking-tighter">{statusText}</span>}
            </button>
        );
    };

    const renderCoachGrid = () => {
        const currentCoachObj = coaches.find(c => c.coach_number === selectedCoach);
        const totalSeats = currentCoachObj ? currentCoachObj.total_seats : 72;

        if (class_type === 'SL' || class_type === '3A') {
            const bays = [];
            for (let i = 1; i <= totalSeats; i += 8) {
                bays.push(i);
            }
            return bays.map((bayStart, bayIdx) => (
                <div key={bayIdx} className="border border-slate-850 bg-slate-950/30 p-4 rounded-2xl flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block w-10">Bay {bayIdx + 1}</span>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="flex flex-col gap-1.5">
                            {[0, 1, 2].map(offset => {
                                const seatNo = bayStart + offset;
                                if (seatNo > totalSeats) return null;
                                return renderSeatButton(seatNo);
                            })}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {[3, 4, 5].map(offset => {
                                const seatNo = bayStart + offset;
                                if (seatNo > totalSeats) return null;
                                return renderSeatButton(seatNo);
                            })}
                        </div>
                    </div>
                    
                    <div className="w-6 flex flex-col justify-center items-center text-[9px] text-slate-700 font-extrabold uppercase tracking-wider select-none border-l border-r border-dashed border-slate-850 h-full py-2">
                        <span>A</span>
                        <span>I</span>
                        <span>S</span>
                        <span>L</span>
                        <span>E</span>
                    </div>

                    <div className="flex flex-col gap-1.5 w-16">
                        {[6, 7].map(offset => {
                            const seatNo = bayStart + offset;
                            if (seatNo > totalSeats) return null;
                            return renderSeatButton(seatNo);
                        })}
                    </div>
                </div>
            ));
        } else if (class_type === '2A') {
            const bays = [];
            for (let i = 1; i <= totalSeats; i += 6) {
                bays.push(i);
            }
            return bays.map((bayStart, bayIdx) => (
                <div key={bayIdx} className="border border-slate-850 bg-slate-950/30 p-4 rounded-2xl flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block w-10">Bay {bayIdx + 1}</span>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="flex flex-col gap-1.5">
                            {[0, 1].map(offset => {
                                const seatNo = bayStart + offset;
                                if (seatNo > totalSeats) return null;
                                return renderSeatButton(seatNo);
                            })}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {[2, 3].map(offset => {
                                const seatNo = bayStart + offset;
                                if (seatNo > totalSeats) return null;
                                return renderSeatButton(seatNo);
                            })}
                        </div>
                    </div>
                    
                    <div className="w-6 flex flex-col justify-center items-center text-[9px] text-slate-700 font-extrabold uppercase tracking-wider select-none border-l border-r border-dashed border-slate-850 h-full py-2">
                        <span>A</span>
                        <span>I</span>
                        <span>S</span>
                        <span>L</span>
                        <span>E</span>
                    </div>

                    <div className="flex flex-col gap-1.5 w-16">
                        {[4, 5].map(offset => {
                            const seatNo = bayStart + offset;
                            if (seatNo > totalSeats) return null;
                            return renderSeatButton(seatNo);
                        })}
                    </div>
                </div>
            ));
        } else if (class_type === '1A') {
            const bays = [];
            for (let i = 1; i <= totalSeats; i += 4) {
                bays.push(i);
            }
            return bays.map((bayStart, bayIdx) => (
                <div key={bayIdx} className="border border-slate-850 bg-slate-950/30 p-4 rounded-2xl flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block w-16">Cabin {String.fromCharCode(65 + bayIdx)}</span>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="flex flex-col gap-1.5">
                            {[0, 1].map(offset => {
                                const seatNo = bayStart + offset;
                                if (seatNo > totalSeats) return null;
                                return renderSeatButton(seatNo);
                            })}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {[2, 3].map(offset => {
                                const seatNo = bayStart + offset;
                                if (seatNo > totalSeats) return null;
                                return renderSeatButton(seatNo);
                            })}
                        </div>
                    </div>
                </div>
            ));
        } else if (class_type === 'CC') {
            const rows = [];
            for (let i = 1; i <= totalSeats; i += 6) {
                rows.push(i);
            }
            return rows.map((rowStart, rowIdx) => (
                <div key={rowIdx} className="border border-slate-850 bg-slate-950/30 p-3 rounded-2xl flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-mono text-slate-500 block w-8 text-center font-bold">R{rowIdx + 1}</span>
                    <div className="grid grid-cols-3 gap-1.5 flex-1">
                        {[0, 1, 2].map(offset => {
                            const seatNo = rowStart + offset;
                            if (seatNo > totalSeats) return null;
                            return renderSeatButton(seatNo);
                        })}
                    </div>

                    <div className="w-5 text-center text-[9px] text-slate-700 font-extrabold select-none">|</div>

                    <div className="grid grid-cols-3 gap-1.5 flex-1">
                        {[3, 4, 5].map(offset => {
                            const seatNo = rowStart + offset;
                            if (seatNo > totalSeats) return null;
                            return renderSeatButton(seatNo);
                        })}
                    </div>
                </div>
            ));
        }
        return null;
    };

    return (
        <AuthenticatedLayout header="Passenger Booking Details">
            <Head title="Book Ticket - Rail-Bharat" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Form: Passengers Details & Seat Map */}
                <div className="lg:col-span-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
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
                                            : 'bg-slate-905 border-slate-850 shadow-md'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-3">
                                        <span className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                            👤 Passenger #{index + 1}
                                            {activePassengerIndex === index && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                    Selecting Seat...
                                                </span>
                                            )}
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

                                    {/* Selected Seat status info */}
                                    <div className="mt-4 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-950/30 border border-slate-850 px-4 py-3 rounded-2xl">
                                        <span className="text-slate-400 font-bold text-[10px] uppercase">Assigned Seat:</span>
                                        <div className="flex items-center gap-3">
                                            {passenger.coach_number && passenger.seat_number ? (
                                                <>
                                                    <span className="font-extrabold text-emerald-400 font-mono text-xs">
                                                        Coach {passenger.coach_number}, Seat {passenger.seat_number} ({getBerthType(passenger.seat_number, class_type)})
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const list = [...passengers];
                                                            list[index].coach_number = '';
                                                            list[index].seat_number = '';
                                                            setPassengers(list);
                                                        }}
                                                        className="text-[11px] text-rose-500 font-bold hover:underline"
                                                    >
                                                        Reset
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">Auto-allocation on payment</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActivePassengerIndex(index);
                                                    document.getElementById('seat-map-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="text-[11px] text-orange-400 hover:text-orange-350 font-bold hover:underline border-l border-slate-800 pl-3"
                                            >
                                                {passenger.coach_number && passenger.seat_number ? 'Change Seat 💺' : 'Select Seat Map 💺'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Passenger Button */}
                            <button
                                type="button"
                                onClick={addPassenger}
                                className={`w-full py-3.5 rounded-2xl border-2 border-dashed font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                                    highContrast
                                        ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                                        : 'border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-200 bg-slate-900/5 hover:bg-slate-900/20'
                                }`}
                            >
                                ➕ Add Another Passenger
                            </button>
                        </div>
                    </form>

                    {/* Interactive Seat Map Selector Section */}
                    {coaches.length > 0 && (
                        <div id="seat-map-section" className={`p-6 rounded-3xl border shadow-xl scroll-mt-6 ${
                            highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850 backdrop-blur-md'
                        }`}>
                            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2 flex items-center gap-2 text-slate-200">
                                💺 Interactive Seat Map Selector
                            </h3>
                            <p className="text-xs text-slate-450 mb-5 font-semibold">
                                Select a passenger tab, pick a coach, and click on any vacant layout box below to bind that seat.
                            </p>

                            {/* Passenger Selection Tabs */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                {passengers.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActivePassengerIndex(idx)}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                                            activePassengerIndex === idx
                                                ? (highContrast ? 'bg-yellow-400 text-black border-2 border-yellow-400' : 'bg-orange-500 text-white shadow-md shadow-orange-500/10')
                                                : (highContrast ? 'border border-yellow-400 bg-black text-yellow-300' : 'bg-slate-850 border border-slate-800 text-slate-300 hover:bg-slate-800')
                                        }`}
                                    >
                                        <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-extrabold">
                                            {idx + 1}
                                        </span>
                                        <span className="max-w-[120px] truncate">{p.name || `Passenger ${idx + 1}`}</span>
                                        {p.coach_number && p.seat_number ? (
                                            <span className="text-[10px] opacity-90 px-1.5 py-0.5 rounded bg-black/30 font-mono font-bold">
                                                {p.coach_number}-{p.seat_number}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] opacity-50 italic">Auto</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {activePassengerIndex !== null && (
                                <div className="space-y-5">
                                    {/* Coach Selection controls */}
                                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-slate-850 pb-4">
                                        <div className="flex items-center gap-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Coach:</label>
                                            <select
                                                value={selectedCoach}
                                                onChange={(e) => setSelectedCoach(e.target.value)}
                                                className={`text-xs rounded-xl px-3 py-1.5 focus:ring-1 focus:outline-none ${
                                                    highContrast
                                                        ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold'
                                                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-orange-500'
                                                }`}
                                            >
                                                {coaches.map(c => (
                                                    <option key={c.coach_number} value={c.coach_number}>
                                                        Coach {c.coach_number} ({class_type})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-2">
                                            {passengers[activePassengerIndex].coach_number && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const list = [...passengers];
                                                        list[activePassengerIndex].coach_number = '';
                                                        list[activePassengerIndex].seat_number = '';
                                                        setPassengers(list);
                                                    }}
                                                    className="text-xs text-rose-500 hover:text-rose-450 font-bold hover:underline"
                                                >
                                                    Reset to Auto-Assign
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Map Legend */}
                                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold text-slate-400 pb-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800"></div>
                                            <span>Available</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500"></div>
                                            <span>Selected (Active Pass.)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded bg-blue-950/50 border border-blue-700"></div>
                                            <span>Selected (Other Pass.)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded bg-rose-950/40 border border-rose-900"></div>
                                            <span>Occupied / Locked</span>
                                        </div>
                                    </div>

                                    {/* Coach Seating Grid layout wrapper */}
                                    <div className="max-h-[460px] overflow-y-auto pr-1.5 space-y-2 rounded-2xl scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                        {loadingSeats ? (
                                            <div className="py-16 text-center text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
                                                Loading seat occupancy chart...
                                            </div>
                                        ) : (
                                            renderCoachGrid()
                                        )}
                                    </div>
                                </div>
                            )}

                            {activePassengerIndex === null && (
                                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-3xl font-semibold bg-slate-950/10">
                                    👉 Click on a passenger tab above or "Select Seat Map" to begin visual seat selection.
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
                                processing ? 'opacity-70 cursor-not-allowed' : ''
                            } ${
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
