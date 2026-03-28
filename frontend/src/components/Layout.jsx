import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background-light dark:bg-[#030712] text-text-primary dark:text-slate-100 flex transition-colors duration-200">
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <Navbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    setMobileOpen={setMobileOpen}
                />
                <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
