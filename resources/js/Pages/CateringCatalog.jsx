import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useContext } from 'react';
import { AccessibilityContext } from '@/Layouts/AuthenticatedLayout';

export default function CateringCatalog(props) {
    const { booking, stationsWithMeals = [], existingOrders = [] } = props;

    // Accessibility Context
    const context = useContext(AccessibilityContext);
    const highContrast = context ? context.highContrast : false;

    // Active Station State (default to first station)
    const [selectedStationId, setSelectedStationId] = useState(
        stationsWithMeals.length > 0 ? stationsWithMeals[0].station_id : null
    );

    // Shopping Cart State: { item_id: { item_id, item_name, price, quantity } }
    const [cart, setCart] = useState({});

    const activeStation = stationsWithMeals.find(s => s.station_id === selectedStationId);

    const addToCart = (meal) => {
        setCart(prev => {
            const existing = prev[meal.id];
            if (existing) {
                return {
                    ...prev,
                    [meal.id]: {
                        ...existing,
                        quantity: existing.quantity + 1
                    }
                };
            } else {
                return {
                    ...prev,
                    [meal.id]: {
                        item_id: meal.id,
                        item_name: meal.item_name,
                        price: Number(meal.price),
                        quantity: 1
                    }
                };
            }
        });
    };

    const updateQuantity = (itemId, change) => {
        setCart(prev => {
            const item = prev[itemId];
            if (!item) return prev;

            const newQty = item.quantity + change;
            if (newQty <= 0) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            }

            return {
                ...prev,
                [itemId]: {
                    ...item,
                    quantity: newQty
                }
            };
        });
    };

    const cartItems = Object.values(cart);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        router.post(route('catering.order'), {
            booking_id: booking.id,
            station_id: selectedStationId,
            items: cartItems,
            total_price: cartTotal
        }, {
            onSuccess: () => {
                setCart({});
                alert('Food order placed successfully!');
            }
        });
    };

    return (
        <AuthenticatedLayout header="E-Catering Service Menu">
            <Head title="E-Catering - Rail-Bharat" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Station stops tabs & meal catalog */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Stations Selector Tabs */}
                    <div className={`p-4 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-65 mb-2 block">
                            Select Delivery Station Stop
                        </span>
                        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                            {stationsWithMeals.length === 0 ? (
                                <span className="text-xs opacity-50 p-2">No catering stations available on this route.</span>
                            ) : (
                                stationsWithMeals.map(s => (
                                    <button
                                        key={s.station_id}
                                        onClick={() => {
                                            setSelectedStationId(s.station_id);
                                            setCart({}); // clear cart on station change
                                        }}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                            selectedStationId === s.station_id
                                                ? (highContrast ? 'bg-yellow-400 text-black border border-yellow-400' : 'bg-orange-600 text-white shadow-md shadow-orange-600/10')
                                                : (highContrast ? 'border border-yellow-400 text-yellow-300 bg-black hover:bg-slate-950' : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200')
                                        }`}
                                    >
                                        🍽️ {s.station_name} ({s.station_code})
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Meal catalog options */}
                    {activeStation && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeStation.meals?.map(meal => (
                                <div
                                    key={meal.id}
                                    className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                                        highContrast
                                            ? 'border-yellow-400 bg-black text-yellow-300'
                                            : 'bg-slate-900/35 border-slate-850 hover:border-slate-800'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center text-3xl shadow-inner">
                                            🍛
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-extrabold text-sm text-slate-100">{meal.item_name}</h4>
                                                <span className="text-xs font-bold text-orange-400">₹{meal.price}</span>
                                            </div>
                                            <p className="text-[11px] opacity-50 mt-1 leading-relaxed">{meal.description}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => addToCart(meal)}
                                        className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase transition-all tracking-wider ${
                                            highContrast
                                                ? 'bg-yellow-400 text-black hover:bg-yellow-350'
                                                : 'bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-200'
                                        }`}
                                    >
                                        Add to Order +
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Cart Summary & Checkout */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Cart Summary */}
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                            Catering Order Cart
                        </h3>

                        {cartItems.length === 0 ? (
                            <div className="text-center py-10 text-xs opacity-50">
                                Cart is empty. Select meals from the catalog to build your order.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1.5 divide-y divide-slate-850/30">
                                    {cartItems.map(item => (
                                        <div key={item.item_id} className="flex justify-between items-center pt-2.5 first:pt-0">
                                            <div>
                                                <span className="text-xs font-bold text-slate-200 block">{item.item_name}</span>
                                                <span className="text-[10px] text-slate-400">₹{item.price} each</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.item_id, -1)}
                                                    className="w-6 h-6 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-350 flex items-center justify-center text-sm font-bold border border-slate-850"
                                                >
                                                    -
                                                </button>
                                                <span className="text-xs font-bold px-1.5 min-w-[20px] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.item_id, 1)}
                                                    className="w-6 h-6 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-350 flex items-center justify-center text-sm font-bold border border-slate-850"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-850 pt-4 flex justify-between items-center">
                                    <span className="text-xs font-bold opacity-60">Total Order Cost</span>
                                    <span className="text-sm font-extrabold text-orange-400">₹{cartTotal.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase transition-all shadow-md ${
                                        highContrast
                                            ? 'bg-yellow-400 text-black hover:bg-yellow-350'
                                            : 'bg-orange-600 hover:bg-orange-500 text-white'
                                    }`}
                                >
                                    Book Meals Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Active Catering Bookings ledger */}
                    <div className={`p-6 rounded-3xl border ${
                        highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                            Active Meals Bookings
                        </h3>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {existingOrders.length === 0 ? (
                                <div className="text-center py-6 text-xs opacity-50">No meals ordered yet.</div>
                            ) : (
                                existingOrders.map(order => (
                                    <div key={order.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-900 space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[10px] opacity-45 uppercase font-bold block">Delivery Station</span>
                                                <span className="text-xs font-bold text-slate-200">{order.station?.name}</span>
                                            </div>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                                order.delivery_status === 'Delivered'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                                {order.delivery_status}
                                            </span>
                                        </div>

                                        <div className="text-[10px] opacity-60 divide-y divide-slate-900/40">
                                            {order.item_details?.map((item, idx) => (
                                                <div key={idx} className="py-1.5 flex justify-between">
                                                    <span>{item.item_name} × {item.quantity}</span>
                                                    <span>₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-slate-900/50 text-[10px]">
                                            <span className="opacity-45">Total Paid</span>
                                            <span className="font-bold text-slate-200">₹{Number(order.total_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
