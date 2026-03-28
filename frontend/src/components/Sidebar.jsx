import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, BookOpen, BarChart2, Settings, LogOut, X, Brain, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getMediaUrl } from '../utils/getMediaUrl';

const Sidebar = ({ isOpen, setIsOpen, mobileOpen, setMobileOpen }) => {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);

    const avatarUrl = user?.profileImage
        ? getMediaUrl(user.profileImage)
        : `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`;

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Roadmaps', icon: Compass, path: '/roadmap' },
        { name: 'Modules', icon: BookOpen, path: '/courses' },
        { name: 'Recommendations', icon: Sparkles, path: '/recommendations' },
        { name: 'Progress', icon: BarChart2, path: '/analytics' },
        { name: 'Settings', icon: Settings, path: '/profile' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-screen bg-white/80 dark:bg-[#030712] border-r border-border-light dark:border-slate-800 z-50 transition-all duration-300 flex flex-col p-4 backdrop-blur-xl
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isOpen ? 'w-[250px]' : 'w-[70px]'}
            `}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        <div className="min-w-[40px] w-10 h-10 bg-secondary border border-border-light rounded-2xl flex items-center justify-center shadow-sm">
                            <span className="text-slate-900 font-bold text-xl"><Brain className="w-5 h-5" /></span>
                        </div>
                        {isOpen && (
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white transition-opacity duration-300">
                                LearnBuddyyy
                            </h1>
                        )}
                    </div>
                    <button className="md:hidden p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-hidden">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-primary text-slate-900 font-semibold shadow-[0_12px_30px_rgba(246,197,71,0.35)]'
                                    : 'text-slate-600 hover:bg-white/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
                                ${!isOpen ? 'justify-center' : ''}
                            `}
                            title={!isOpen ? item.name : ''}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-border-light dark:border-slate-800 space-y-2">
                    <div className={`flex items-center gap-3 px-2 py-2 ${!isOpen ? 'justify-center' : ''}`}>
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800 flex-shrink-0"
                        />
                        {isOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                            text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400
                            ${!isOpen ? 'justify-center' : ''}
                        `}
                        title={!isOpen ? 'Logout' : ''}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
