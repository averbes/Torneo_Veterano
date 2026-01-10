import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#050510] text-[#e0e0ff] font-sans selection:bg-[#00f2ff] selection:text-[#050510]">
            {/* Dynamic Background Effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f2ff]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7000ff]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow container mx-auto px-4 py-8">
                    {children}
                </main>

                <footer className="border-t border-[#ffffff10] bg-[#0a0a1a]/80 backdrop-blur-md p-6 text-center text-sm text-[#ffffff50]">
                    <p>© 2026 NEO-LEAGUE VETERANS // HIGH-PERFORMANCE SPORTS DASHBOARD</p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
