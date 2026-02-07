import React from 'react';
import { Outlet } from 'react-router-dom';
import { NeuralLink } from './components/NeuralLink';
import { useSession } from './state/SessionContext';
import { GovHeader } from './components/GovHeader';
import { GovFooter } from './components/GovFooter';

export const Layout: React.FC = () => {
    const { logs, isActive } = useSession();

    return (
        <div className="flex flex-col min-h-screen bg-gov-bg text-gov-text font-sans">
            {/* Government Header */}
            <GovHeader />

            <div className="flex flex-1 relative">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative z-10">
                    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>

                {/* Neural Link Sidebar (Right) - Overlay or Fixed if active */}
                {isActive && (
                    <div className="w-80 border-l border-gray-300 bg-white shadow-xl z-20 hidden lg:block">
                        <NeuralLink logs={logs} />
                    </div>
                )}
            </div>

            {/* Government Footer */}
            <GovFooter />
        </div>
    );
};
