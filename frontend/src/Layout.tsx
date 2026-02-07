import React from 'react';
import { Outlet } from 'react-router-dom';
import { NeuralLink } from './components/NeuralLink';
import { useSession } from './state/SessionContext';

export const Layout: React.FC = () => {
    const { logs, isActive } = useSession();

    return (
        <div className="flex h-screen w-screen bg-kiosk-bg text-white overflow-hidden relative">
            {/* Neural Link Sidebar (Right) */}
            {isActive && (
                <div className="w-80 h-full border-l border-white/10 z-20">
                    <NeuralLink logs={logs} />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-10">
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>

                {/* Safety Footer */}
                <div className="h-16 bg-black/60 backdrop-blur border-t border-white/10 flex items-center justify-center text-xs text-white/50 uppercase tracking-widest">
                    ⚠️ AI-Generated Guidance • Not Legal Advice • Consult an Advocate
                </div>
            </div>

            {/* Background Elements (Optional for visual flair) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 pointer-events-none z-0" />
        </div>
    );
};
