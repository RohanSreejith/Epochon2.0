import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../state/SessionContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { startSession } = useSession();

    const handleStart = () => {
        startSession();
        navigate('/session');
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center relative z-10">
            <div className="mb-12 animate-pulse-slow">
                <ShieldCheck size={96} className="text-safe-green mx-auto mb-6" />
                <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                    NYAYA-VAANI
                </h1>
                <p className="text-xl text-white/60 tracking-wide font-light max-w-2xl mx-auto">
                    Autonomous Legal Aid & Triage System • India 2026
                </p>
            </div>

            <button
                onClick={handleStart}
                className="group relative px-12 py-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
                <div className="flex items-center gap-4 text-2xl font-bold">
                    <span>Start Consultation</span>
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/10 group-hover:ring-white/30 transition-all" />
            </button>

            <div className="mt-16 grid grid-cols-3 gap-8 text-white/40 text-sm font-mono uppercase tracking-widest">
                <div>High Stakes Analysis</div>
                <div>Multi-Agent Debate</div>
                <div>Visual Reasoning</div>
            </div>
        </div>
    );
};
