import React, { useEffect, useRef } from 'react';
import { Terminal, Cpu, Shield, Scale, AlertTriangle, TrendingUp } from 'lucide-react';

interface Log {
    timestamp: string;
    agent: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface NeuralLinkProps {
    logs: Log[];
}

export const NeuralLink: React.FC<NeuralLinkProps> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Parse and format JSON into human-readable content
    const formatMessage = (agent: string, msg: string) => {
        try {
            // Try to parse as JSON
            const jsonMatch = msg.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);

                // Format based on agent type
                if (agent === 'Legal') {
                    return (
                        <div className="space-y-2">
                            {parsed.sections && (
                                <div>
                                    <div className="text-gov-saffron font-semibold mb-1">📋 Applicable Sections:</div>
                                    <div className="pl-3 space-y-1">
                                        {parsed.sections.map((sec: string, i: number) => (
                                            <div key={i} className="text-sm">• {sec}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {parsed.reasoning && (
                                <div>
                                    <div className="text-blue-400 font-semibold mb-1">💡 Reasoning:</div>
                                    <div className="pl-3 text-sm text-gray-300">{parsed.reasoning}</div>
                                </div>
                            )}
                            {parsed.advice && (
                                <div>
                                    <div className="text-green-400 font-semibold mb-1">✅ Advice:</div>
                                    <div className="pl-3 text-sm text-gray-300">{parsed.advice}</div>
                                </div>
                            )}
                        </div>
                    );
                }

                if (agent === 'Risk') {
                    return (
                        <div className="space-y-2">
                            {parsed.severity && (
                                <div className="flex items-center gap-2">
                                    <span className="text-red-400 font-semibold">⚠️ Severity:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${parsed.severity.toLowerCase().includes('high') ? 'bg-red-500/20 text-red-300' :
                                            parsed.severity.toLowerCase().includes('medium') ? 'bg-yellow-500/20 text-yellow-300' :
                                                'bg-green-500/20 text-green-300'
                                        }`}>{parsed.severity}</span>
                                </div>
                            )}
                            {parsed.concerns && (
                                <div>
                                    <div className="text-orange-400 font-semibold mb-1">🚨 Concerns:</div>
                                    <div className="pl-3 space-y-1">
                                        {(Array.isArray(parsed.concerns) ? parsed.concerns : [parsed.concerns]).map((concern: string, i: number) => (
                                            <div key={i} className="text-sm">• {concern}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                if (agent === 'Ethics') {
                    return (
                        <div className="space-y-2">
                            {parsed.veto !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="text-purple-400 font-semibold">🛡️ Veto:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${parsed.veto ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                                        }`}>{parsed.veto ? 'BLOCKED' : 'APPROVED'}</span>
                                </div>
                            )}
                            {parsed.reason && (
                                <div>
                                    <div className="text-purple-300 font-semibold mb-1">📝 Reason:</div>
                                    <div className="pl-3 text-sm text-gray-300">{parsed.reason}</div>
                                </div>
                            )}
                        </div>
                    );
                }

                if (agent === 'Confidence') {
                    return (
                        <div className="space-y-2">
                            {parsed.score !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan-400 font-semibold">📊 Score:</span>
                                    <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${parsed.score >= 70 ? 'bg-green-500' :
                                                    parsed.score >= 40 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${parsed.score}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold">{parsed.score}%</span>
                                </div>
                            )}
                            {parsed.reasoning && (
                                <div>
                                    <div className="text-cyan-300 font-semibold mb-1">💭 Analysis:</div>
                                    <div className="pl-3 text-sm text-gray-300">{parsed.reasoning}</div>
                                </div>
                            )}
                            {parsed.refusal_triggered && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded p-2 mt-2">
                                    <span className="text-red-400 font-bold">⛔ REFUSAL TRIGGERED</span>
                                </div>
                            )}
                        </div>
                    );
                }

                // Default JSON display for unknown formats
                return (
                    <div className="bg-black/30 rounded p-2 text-xs font-mono text-gray-400">
                        {JSON.stringify(parsed, null, 2)}
                    </div>
                );
            }
        } catch (e) {
            // Not JSON, return as-is
        }
        return <span className="break-words text-gray-300">{msg}</span>;
    };

    const getAgentIcon = (agent: string) => {
        switch (agent) {
            case 'Legal': return <Scale size={14} />;
            case 'Risk': return <AlertTriangle size={14} />;
            case 'Ethics': return <Shield size={14} />;
            case 'Confidence': return <TrendingUp size={14} />;
            default: return <Cpu size={14} />;
        }
    };

    const getAgentColor = (agent: string) => {
        switch (agent) {
            case 'System': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
            case 'Legal': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'Risk': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'Ethics': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
            case 'Confidence': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
            default: return 'text-green-400 bg-green-500/10 border-green-500/30';
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white overflow-hidden border-l-4 border-gov-saffron shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-gov-blue to-[#000066] border-b-2 border-gov-saffron flex justify-between items-center shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-gov-saffron" />
                    <div>
                        <div className="font-bold tracking-wider text-sm">NEURAL LINK</div>
                        <div className="text-[10px] text-gray-400">Agent Monitoring System</div>
                    </div>
                </div>
                <Cpu size={18} className="animate-pulse text-gov-green" />
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {logs.length === 0 && (
                    <div className="text-gray-500 italic text-center mt-10 flex flex-col items-center gap-2">
                        <Cpu size={32} className="animate-pulse opacity-50" />
                        <div>Awaiting neural signals...</div>
                    </div>
                )}

                {logs.map((log, idx) => (
                    <div
                        key={idx}
                        className={`border rounded-lg p-3 ${getAgentColor(log.agent)} backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg`}
                    >
                        {/* Agent Header */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-current/20">
                            <div className="flex items-center gap-2">
                                {getAgentIcon(log.agent)}
                                <span className="font-bold text-sm">{log.agent}</span>
                            </div>
                            <span className="text-[10px] opacity-60">{log.timestamp}</span>
                        </div>

                        {/* Message Content */}
                        <div className="text-sm">
                            {formatMessage(log.agent, log.message)}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Footer */}
            <div className="p-3 bg-gradient-to-r from-gov-green to-[#0a5a0a] text-xs text-white text-center border-t-2 border-gov-saffron shrink-0 shadow-lg">
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">SECURE CONNECTION • ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
};
