import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../state/SessionContext';
import { ConfidenceRadar } from '../components/ConfidenceRadar';
import { ShatterEffect } from '../components/ShatterEffect';
import { Send, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Session: React.FC = () => {
    const { addLog, endSession, logs } = useSession(); // logs needed? maybe just for debug
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [shatter, setShatter] = useState(false);
    const [confidenceData, setConfidenceData] = useState<any[]>([
        { subject: 'Legal', A: 0, fullMark: 100 },
        { subject: 'Risk', A: 0, fullMark: 100 },
        { subject: 'Ethics', A: 0, fullMark: 100 },
        { subject: 'Confidence', A: 0, fullMark: 100 },
    ]);
    const navigate = useNavigate();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        // Simulate thinking / call backend
        try {
            addLog("System", `Processing input: "${userMsg.substring(0, 20)}..."`, "info");

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMsg })
            });

            const data = await response.json();

            // Add backend logs to Neural Link
            if (data.logs) {
                data.logs.forEach((log: any) => {
                    addLog(log.agent, log.msg, log.agent === 'Ethics' && log.msg.includes('VETO') ? 'error' : 'info');
                });
            }

            if (data.status === "REFUSED") {
                setShatter(true);
                setMessages(prev => [...prev, { role: 'assistant', text: `❌ SYSTEM REFUSAL: ${data.reason}` }]);
                addLog("Coordinator", `REFUSED: ${data.reason}`, "error");
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
                // Update Radar with mock values or real if backend provides
                setConfidenceData([
                    { subject: 'Legal', A: 85, fullMark: 100 },
                    { subject: 'Risk', A: 60, fullMark: 100 }, // Example dynamic
                    { subject: 'Ethics', A: 100, fullMark: 100 },
                    { subject: 'Confidence', A: 90, fullMark: 100 },
                ]);
            }

        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', text: "⚠️ Connection Error. Ensure Backend is running." }]);
            addLog("System", "Backend unreachable", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEnd = () => {
        endSession();
        navigate('/');
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
            <ShatterEffect trigger={shatter} onComplete={() => setShatter(false)} />

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-mono text-sm tracking-widest text-white/60">LIVE SESSION</span>
                </div>
                <button onClick={handleEnd} className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1 rounded">
                    END SESSION
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white/10 text-white/90 rounded-bl-none border border-white/10'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start animate-pulse text-white/40 text-xs ml-2">
                                Agents Debating...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-black/20 border-t border-white/10 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your situation..."
                            className="flex-1 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button onClick={handleSend} disabled={loading} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            <Send size={20} />
                        </button>
                    </div>
                </div>

                {/* Visuals Sidebar */}
                <div className="w-72 flex flex-col gap-4">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <h3 className="text-xs font-mono uppercase text-white/40 mb-2">Confidence Radar</h3>
                        <ConfidenceRadar data={confidenceData} />
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex-1">
                        <h3 className="text-xs font-mono uppercase text-white/40 mb-2">Real-time Analysis</h3>
                        <div className="space-y-2 text-xs text-white/60">
                            <div className="flex justify-between">
                                <span>Status</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Agents</span>
                                <span>5 Online</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <AlertTriangle size={16} className="text-yellow-500 mb-1" />
                                <p className="leading-tight">
                                    Providing false information is a punishable offense under IPC Section 177.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
