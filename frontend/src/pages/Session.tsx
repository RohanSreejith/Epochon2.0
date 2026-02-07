import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../state/SessionContext';
import { ConfidenceRadar } from '../components/ConfidenceRadar';
import { ShatterEffect } from '../components/ShatterEffect';
import { Send, AlertTriangle, Shield, Gavel, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper to parse potential JSON from agents
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
    try {
        // Attempt to extract JSON if it's wrapped in text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        const data = JSON.parse(jsonStr);

        // Check if it's the expected Legal Agent format
        if (data.sections || data.advice || data.reasoning) {
            return (
                <div className="flex flex-col gap-4">
                    {/* Sections / Laws */}
                    {data.sections && data.sections.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {data.sections.map((sec: string, idx: number) => (
                                <span key={idx} className="bg-gov-saffron/10 text-gov-saffron border border-gov-saffron/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {sec}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Reasoning */}
                    {data.reasoning && (
                        <div className="text-gray-800 text-lg leading-relaxed">
                            {data.reasoning}
                        </div>
                    )}

                    {/* Advice Box */}
                    {data.advice && (
                        <div className="mt-2 bg-blue-50 border-l-4 border-gov-blue p-4 rounded-r-lg">
                            <h4 className="text-gov-blue font-bold text-sm uppercase mb-1 flex items-center gap-2">
                                <Gavel size={16} /> Recommended Action
                            </h4>
                            <p className="text-gray-900 font-medium text-lg">
                                {data.advice}
                            </p>
                        </div>
                    )}
                </div>
            );
        }
    } catch (e) {
        // Not JSON or parse failed, fall back to text
    }

    return <div className="text-lg leading-relaxed whitespace-pre-wrap">{text}</div>;
};

export const Session: React.FC = () => {
    const { addLog, endSession, startSession, isActive, logs } = useSession();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // Ensure session is active (for Neural Link visibility)
    useEffect(() => {
        if (!isActive) {
            startSession();
        }
    }, []);
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

        try {
            addLog("System", `Processing input: "${userMsg.substring(0, 20)}..."`, "info");

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMsg })
            });

            const data = await response.json();

            // Add backend logs to Neural Link & Parse for Radar
            let newLegalScore = 50;
            let newRiskScore = 50;
            let newEthicsScore = 100;
            let newConfScore = 50;

            if (data.logs) {
                data.logs.forEach((log: any) => {
                    // Map backend log types to frontend types
                    const logType = (log.agent === 'Ethics' && log.msg.includes('VETO')) ? 'error' : 'info';
                    addLog(log.agent, log.msg, logType);

                    try {
                        // Parse Confidence
                        if (log.agent === 'Confidence') {
                            const conf = JSON.parse(log.msg);
                            newConfScore = conf.score || 0;
                        }
                        // Parse Risk
                        if (log.agent === 'Risk') {
                            const risk = JSON.parse(log.msg);
                            // Map severity to score (High risk = low safety score)
                            if (risk.severity?.toLowerCase().includes('high')) newRiskScore = 30;
                            else if (risk.severity?.toLowerCase().includes('medium')) newRiskScore = 60;
                            else newRiskScore = 90;
                        }
                        // Parse Legal
                        if (log.agent === 'Legal') {
                            const legal = JSON.parse(log.msg);
                            if (legal.sections && legal.sections.length > 0) newLegalScore = 90;
                            else newLegalScore = 40;
                        }
                    } catch (e) {
                        // Ignore parse errors from logs
                    }
                });

                // Update Radar
                setConfidenceData([
                    { subject: 'Legal', A: newLegalScore, fullMark: 100 },
                    { subject: 'Risk', A: newRiskScore, fullMark: 100 },
                    { subject: 'Ethics', A: newEthicsScore, fullMark: 100 },
                    { subject: 'Confidence', A: newConfScore, fullMark: 100 },
                ]);
            }

            if (data.status === "REFUSED") {
                setShatter(true);
                setMessages(prev => [...prev, { role: 'assistant', text: `❌ SYSTEM REFUSAL: ${data.reason}` }]);
                addLog("Coordinator", `REFUSED: ${data.reason}`, "error");
            } else {
                // Ensure response is treated as string for the FormattedMessage component
                const responseText = typeof data.response === 'object' ? JSON.stringify(data.response) : data.response;
                setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
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
        <div className="h-full w-full overflow-hidden flex flex-col gap-6 bg-gray-50/50">
            <ShatterEffect trigger={shatter} onComplete={() => setShatter(false)} />

            {/* Kiosk Header */}
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-sm ring-4 ring-red-100" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Live Consultation</h2>
                        <p className="text-sm text-gray-500 font-medium">Department of Justice • AI Assistant Active</p>
                    </div>
                </div>

                <button
                    onClick={handleEnd}
                    className="flex items-center gap-3 px-6 py-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all font-bold text-lg border border-transparent hover:border-red-200"
                >
                    <XCircle size={24} />
                    <span>End Session</span>
                </button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* Main Chat Area - Kiosk Style */}
                <main className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                <Shield size={64} className="mb-4" />
                                <p className="text-xl font-medium">AI Agent Ready. Speak or type to begin.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-gov-blue text-white rounded-br-none'
                                    : 'bg-gray-50 text-gray-900 rounded-bl-none border border-gray-200'
                                    }`}>
                                    <FormattedMessage text={msg.text} />
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-4 text-gray-500 p-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-gov-saffron rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-3 h-3 bg-gov-saffron rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-3 h-3 bg-gov-saffron rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <span className="font-medium">Consulting legal database...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area - Large Touch Targets */}
                    <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your legal query here..."
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-6 py-5 text-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gov-blue/10 focus:border-gov-blue transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="px-8 bg-gov-blue text-white rounded-xl hover:bg-gov-blue/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                            <span className="font-bold text-lg hidden md:block">SEND</span>
                            <Send size={24} />
                        </button>
                    </div>
                </main>

                {/* Sidebar - Visuals */}
                <aside className="hidden md:flex w-96 flex-col gap-6">
                    {/* Confidence */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Confidence Analysis</h3>
                        <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-2xl">
                            <ConfidenceRadar data={confidenceData} />
                        </div>
                    </div>

                    {/* Status & Alerts */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
                        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">System Status</h3>

                        <div className="space-y-6 flex-1">
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                                <span className="text-gray-700 font-medium">Network</span>
                                <span className="text-green-700 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                    SECURE
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-gray-700 font-medium">Active Agents</span>
                                <span className="text-gov-blue font-bold">5 ONLINE</span>
                            </div>

                            <div className="mt-auto p-5 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex gap-3 mb-2 text-amber-800 font-bold items-center">
                                    <AlertTriangle size={20} />
                                    <span>Disclaimer</span>
                                </div>
                                <p className="text-amber-900/80 text-sm leading-relaxed">
                                    This system provides legal information, not binding advice.
                                    Providing false information is punishable under IPC Section 177.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};
