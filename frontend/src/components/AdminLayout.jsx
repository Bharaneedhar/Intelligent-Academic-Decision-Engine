import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BookOpen, BarChart2, LogOut, Shield, Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore';

const AdminLayout = ({ children }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Roles', icon: Briefcase, path: '/admin/roles' },
        { name: 'Skills', icon: BookOpen, path: '/admin/skills' },
        { name: 'Roadmap Config', icon: BookOpen, path: '/admin/roadmaps' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-background-light text-text-primary">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky lg:top-0 top-0 left-0 h-screen w-64 flex-shrink-0 bg-white/95 lg:bg-white/80 border-r border-border-light flex flex-col p-4 shadow-xl lg:shadow-sm backdrop-blur-xl z-50 transition-transform duration-300
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center justify-between px-2 mb-10 pt-2 border-b border-border-light lg:border-none pb-4 lg:pb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary border border-border-light rounded-2xl flex items-center justify-center shadow-md">
                            <Shield className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-900">LearnBuddyyy</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Admin Portal</p>
                        </div>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.name} to={item.path} end={item.path === '/admin'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm ${isActive
                                ? 'bg-primary text-slate-900 font-bold shadow-[0_12px_30px_rgba(246,197,71,0.35)]'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-border-light">
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-semibold">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Topbar */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-border-light bg-white/90 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary border border-border-light rounded-xl flex items-center justify-center shadow-sm">
                            <Shield className="w-4 h-4 text-slate-900" />
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Admin Portal</h1>
                    </div>
                    <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
