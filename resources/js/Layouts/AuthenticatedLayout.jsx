import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, createContext, useContext } from 'react';

// Create Accessibility Context
export const AccessibilityContext = createContext();

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth.user;

    // High Contrast State
    const [highContrast, setHighContrast] = useState(() => {
        return localStorage.getItem('high-contrast') === 'true';
    });

    // Language State
    const [locale, setLocale] = useState(() => {
        return localStorage.getItem('locale') || 'en';
    });

    // Text translations dictionary
    const translations = {
        en: {
            dashboard: 'Dashboard',
            search_trains: 'Book Tickets',
            grievances: 'Help & SOS',
            admin_area: 'Admin Panel',
            high_contrast: 'High Contrast',
            normal_contrast: 'Normal View',
            profile: 'Profile',
            logout: 'Log Out',
            notification_title: 'Notifications',
            no_notifications: 'No new alerts',
            mark_read: 'Read',
            welcome: 'Welcome back',
            sos_warning: '🚨 EMERGENCY SOS ACTIVE',
        },
        hi: {
            dashboard: 'डैशबोर्ड',
            search_trains: 'टिकट बुक करें',
            grievances: 'सहायता और SOS',
            admin_area: 'एडमिन पैनल',
            high_contrast: 'उच्च कंट्रास्ट',
            normal_contrast: 'सामान्य दृश्य',
            profile: 'प्रोफ़ाइल',
            logout: 'लॉग आउट',
            notification_title: 'सूचनाएं',
            no_notifications: 'कोई नई सूचना नहीं',
            mark_read: 'पढ़े',
            welcome: 'सुस्वागतम',
            sos_warning: '🚨 आपातकालीन SOS सक्रिय',
        },
        bn: {
            dashboard: 'ড্যাশবোর্ড',
            search_trains: 'টিকিট বুক করুন',
            grievances: 'সহায়তা ও SOS',
            admin_area: 'অ্যাডমিন প্যানেল',
            high_contrast: 'উচ্চ বৈসাদৃশ্য',
            normal_contrast: 'সাধারণ ভিউ',
            profile: 'প্রোফাইল',
            logout: 'লগ আউট',
            notification_title: 'বিজ্ঞপ্তি',
            no_notifications: 'কোন নতুন সতর্কতা নেই',
            mark_read: 'পঠিত',
            welcome: 'স্বাগতম',
            sos_warning: '🚨 জরুরী SOS সক্রিয়',
        },
        ta: {
            dashboard: 'டேஷ்போர்டு',
            search_trains: 'டிக்கெட் முன்பதிவு',
            grievances: 'உதவி & SOS',
            admin_area: 'நிர்வாக குழு',
            high_contrast: 'உயர் கான்ட்ராஸ்ட்',
            normal_contrast: 'சாதாரண காட்சி',
            profile: 'சுயவிவரம்',
            logout: 'வெளியேறு',
            notification_title: 'அறிவிப்புகள்',
            no_notifications: 'புதிய விழிப்பூட்டல்கள் இல்லை',
            mark_read: 'படிக்கப்பட்டது',
            welcome: 'வரவேற்கிறோம்',
            sos_warning: '🚨 அவசர SOS செயலில் உள்ளது',
        }
    };

    const t = (key) => {
        return translations[locale]?.[key] || translations['en'][key] || key;
    };

    useEffect(() => {
        localStorage.setItem('high-contrast', highContrast);
        if (highContrast) {
            document.documentElement.classList.add('high-contrast-mode');
        } else {
            document.documentElement.classList.remove('high-contrast-mode');
        }
    }, [highContrast]);

    useEffect(() => {
        localStorage.setItem('locale', locale);
    }, [locale]);

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showingNotifyDropdown, setShowingNotifyDropdown] = useState(false);

    // Filter unread notifications
    const userNotifications = usePage().props.notifications || [];
    const unreadNotifications = userNotifications.filter(n => n.read_status === 'Unread');

    const handleMarkAsRead = (id) => {
        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // notification state is refreshed automatically via inertia
            }
        });
    };

    return (
        <AccessibilityContext.Provider value={{ locale, t, highContrast, setHighContrast, setLocale }}>
            <div className={`min-h-screen transition-colors duration-200 ${
                highContrast 
                    ? 'bg-black text-yellow-300 font-bold border-yellow-500' 
                    : 'bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white'
            }`}>
                
                {/* Visual Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500"></div>

                <nav className={`border-b backdrop-blur-md sticky top-0 z-50 ${
                    highContrast 
                        ? 'border-yellow-400 bg-black' 
                        : 'border-slate-800 bg-slate-900/80 shadow-lg shadow-slate-950/20'
                }`}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            
                            {/* Logo and Brand */}
                            <div className="flex items-center gap-6">
                                <Link href="/" className="flex items-center gap-2.5 group">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-white to-emerald-400">
                                        RAIL-BHARAT
                                    </span>
                                </Link>

                                <div className="hidden space-x-1 sm:flex items-center">
                                    <NavLink href={route('home')} active={route().current('home')} className={highContrast ? 'text-yellow-300 border-yellow-400' : 'text-slate-300 hover:text-orange-400'}>
                                        {t('search_trains')}
                                    </NavLink>
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')} className={highContrast ? 'text-yellow-300 border-yellow-400' : 'text-slate-300 hover:text-orange-400'}>
                                        {t('dashboard')}
                                    </NavLink>
                                    <NavLink href={route('complaints.index')} active={route().current('complaints.index')} className={highContrast ? 'text-yellow-300 border-yellow-400' : 'text-slate-300 hover:text-orange-400'}>
                                        {t('grievances')}
                                    </NavLink>
                                    {user.role === 'admin' && (
                                        <NavLink href={route('dashboard')} active={false} className="text-rose-400 hover:text-rose-300 font-semibold border-rose-500/20">
                                            ⚙️ {t('admin_area')}
                                        </NavLink>
                                    )}
                                </div>
                            </div>

                            {/* Accessibitly, Notification and User Dropdown */}
                            <div className="hidden sm:flex sm:items-center sm:gap-4">
                                
                                {/* Language Toggle */}
                                <select 
                                    value={locale} 
                                    onChange={(e) => setLocale(e.target.value)}
                                    className={`text-xs rounded-lg px-2 py-1 focus:ring-1 focus:outline-none ${
                                        highContrast 
                                            ? 'bg-black text-yellow-300 border-2 border-yellow-400 font-bold' 
                                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750 focus:ring-orange-500'
                                    }`}
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी</option>
                                    <option value="bn">বাংলা</option>
                                    <option value="ta">தமிழ்</option>
                                </select>

                                {/* Contrast Toggle */}
                                <button
                                    onClick={() => setHighContrast(!highContrast)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                        highContrast
                                            ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    {highContrast ? t('normal_contrast') : t('high_contrast')}
                                </button>

                                {/* Live Notification Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowingNotifyDropdown(!showingNotifyDropdown)}
                                        className={`relative p-1.5 rounded-lg focus:outline-none ${
                                            highContrast
                                                ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black border border-yellow-400'
                                                : 'text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadNotifications.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white animate-pulse">
                                                {unreadNotifications.length}
                                            </span>
                                        )}
                                    </button>

                                    {showingNotifyDropdown && (
                                        <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border overflow-hidden z-50 ${
                                            highContrast 
                                                ? 'bg-black border-2 border-yellow-400 text-yellow-300' 
                                                : 'bg-slate-900 border-slate-800 text-slate-200'
                                        }`}>
                                            <div className="px-4 py-2.5 font-bold border-b border-inherit text-sm flex justify-between items-center">
                                                <span>{t('notification_title')} ({unreadNotifications.length})</span>
                                                <button onClick={() => setShowingNotifyDropdown(false)} className="text-xs hover:underline">Close</button>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto divide-y divide-inherit">
                                                {userNotifications.length === 0 ? (
                                                    <div className="p-4 text-center text-xs opacity-60">{t('no_notifications')}</div>
                                                ) : (
                                                    userNotifications.map(notification => (
                                                        <div key={notification.id} className={`p-3 text-xs flex gap-2.5 ${
                                                            notification.read_status === 'Unread' 
                                                                ? (highContrast ? 'bg-yellow-400/20' : 'bg-slate-800/40') 
                                                                : ''
                                                        }`}>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-slate-100 flex items-center justify-between">
                                                                    <span className={notification.type === 'SOS' ? 'text-rose-500 font-bold' : ''}>
                                                                        {notification.title}
                                                                    </span>
                                                                    <span className="text-[9px] opacity-40">
                                                                        {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 opacity-70 leading-relaxed">{notification.message}</p>
                                                            </div>
                                                            {notification.read_status === 'Unread' && (
                                                                <button 
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    className={`px-1.5 py-0.5 rounded text-[10px] self-start border ${
                                                                        highContrast 
                                                                            ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black' 
                                                                            : 'border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white'
                                                                    }`}
                                                                >
                                                                    {t('mark_read')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User dropdown */}
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className={`inline-flex items-center rounded-lg border px-3.5 py-1.5 text-sm font-semibold leading-4 transition duration-150 ease-in-out focus:outline-none ${
                                                        highContrast 
                                                            ? 'bg-black text-yellow-300 border-2 border-yellow-400' 
                                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-750'
                                                    }`}
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
                                                    {user.name} ({user.role === 'admin' ? 'Admin' : 'Passenger'})
                                                    <svg className="ms-2 -me-0.5 h-4 w-4 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content contentClasses={highContrast ? 'bg-black border-2 border-yellow-400' : 'bg-slate-900 border border-slate-800 text-slate-300'}>
                                            <Dropdown.Link href={route('profile.edit')} className={highContrast ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}>
                                                {t('profile')}
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('logout')} method="post" as="button" className={highContrast ? 'text-yellow-300 hover:bg-yellow-400/20 font-bold w-full text-left' : 'text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left'}>
                                                {t('logout')}
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            {/* Mobile Hamburger menu */}
                            <div className="-me-2 flex items-center sm:hidden gap-2">
                                <button
                                    onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                    className={`inline-flex items-center justify-center rounded-lg p-2 transition duration-150 ease-in-out ${
                                        highContrast 
                                            ? 'text-yellow-300 border-2 border-yellow-400 bg-black' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 bg-slate-900 border border-slate-800'
                                    }`}
                                >
                                    <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    <div className={`${showingNavigationDropdown ? 'block animate-slide-down' : 'hidden'} sm:hidden border-t ${highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'border-slate-850 bg-slate-950'}`}>
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink href={route('home')} active={route().current('home')} className="text-inherit">
                                {t('search_trains')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="text-inherit">
                                {t('dashboard')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('complaints.index')} active={route().current('complaints.index')} className="text-inherit">
                                {t('grievances')}
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-slate-800 pb-3 pt-3">
                            <div className="px-4 flex justify-between items-center mb-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-100">{user.name}</div>
                                    <div className="text-xs opacity-65">{user.email}</div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <select 
                                        value={locale} 
                                        onChange={(e) => setLocale(e.target.value)}
                                        className="text-xs bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5"
                                    >
                                        <option value="en">EN</option>
                                        <option value="hi">HI</option>
                                        <option value="bn">BN</option>
                                        <option value="ta">TA</option>
                                    </select>
                                    <button
                                        onClick={() => setHighContrast(!highContrast)}
                                        className="px-2 py-0.5 text-xs bg-slate-900 border border-slate-850 rounded font-bold"
                                    >
                                        A
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')} className="text-inherit">
                                    {t('profile')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-inherit w-full text-left">
                                    {t('logout')}
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Display Flash Messages */}
                {flash.success && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
                            highContrast
                                ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        }`}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash.error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="p-4 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-500/30 flex items-center gap-3 animate-fade-in">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm">{flash.error}</span>
                        </div>
                    </div>
                )}

                {header && (
                    <header className={`border-b ${
                        highContrast 
                            ? 'border-yellow-400 bg-black' 
                            : 'bg-slate-900/40 border-slate-850'
                    }`}>
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            <div className={`text-2xl font-bold tracking-tight ${
                                highContrast ? 'text-yellow-300' : 'text-slate-100'
                            }`}>
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>

                {/* Accessible Footer */}
                <footer className={`mt-auto border-t py-8 text-center text-xs opacity-60 ${
                    highContrast 
                        ? 'border-yellow-400 bg-black text-yellow-300' 
                        : 'border-slate-900 bg-slate-950/50'
                }`}>
                    <p className="max-w-md mx-auto leading-relaxed">
                        © 2026 Rail-Bharat Reservation & Passenger Assistance. Supported by RPF & Ministry of Railways. Fully keyboard accessible.
                    </p>
                </footer>
            </div>
        </AccessibilityContext.Provider>
    );
}
