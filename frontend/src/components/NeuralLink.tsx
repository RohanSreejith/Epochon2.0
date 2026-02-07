import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: string;
    agent: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface NeuralLinkProps {
    logs: LogEntry[];
}

const AGENT_COLORS: Record<string, string> = {
    "Coordinator": "text-purple-400",
    "Legal": "text-blue-400",
    "Risk": "text-orange-400",
    "Ethics": "text-red-400",
    "Confidence": "text-yellow-400",
    "System": "text-green-400",
};

export const NeuralLink: React.FC<NeuralLinkProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-panel h-full flex flex-col p-4 bg-black/40 border-l border-white/10 w-80 fixed right-0 top-0 bottom-0 z-50 font-mono text-xs">
            <div className="flex items-center gap-2 mb-4 text-white/60 uppercase tracking-widest text-[10px] border-b border-white/10 pb-2">
                <Terminal size={14} />
                Neural Link v2.0
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-3 scrollbar-hide"
            >
                {logs.map((log) => (
                    <div key={log.id} className="animate-fade-in">
                        <div className="flex items-center gap-2 opacity-50 text-[10px] mb-0.5">
                            <span>[{log.timestamp}]</span>
                        </div>
                        <div className="flex gap-2">
                            <span className={`font-bold ${AGENT_COLORS[log.agent] || "text-white"}`}>
                                {log.agent}&gt;
                            </span>
                            <span className="text-white/80 break-words leading-tight">
                                {log.message}
                            </span>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-white/20 italic text-center mt-10">
                        Awaiting input stream...
                    </div>
                )}
            </div>
        </div>
    );
};
