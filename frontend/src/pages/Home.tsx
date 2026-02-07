import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../state/SessionContext';
import { ShieldCheck, ArrowRight, Gavel, Scale, FileText, Users } from 'lucide-react';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { startSession } = useSession();

    const handleStart = () => {
        startSession();
        navigate('/session');
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Hero Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gov-saffron via-white to-gov-green" />

                <ShieldCheck size={64} className="text-gov-blue mb-6" />

                <h1 className="text-4xl md:text-5xl font-bold text-gov-blue mb-4">
                    Welcome to Nyaya-Setu
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-8">
                    An AI-powered autonomous legal aid service bridging the gap between citizens and justice.
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">Initiative by Department of Justice, Government of India</span>
                </p>

                <button
                    onClick={handleStart}
                    className="group flex items-center gap-3 px-8 py-4 bg-gov-blue text-white rounded-md font-semibold hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl"
                >
                    <span>Start Legal Consultation</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            {/* Quick Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard
                    icon={<Gavel size={32} />}
                    title="Case Analysis"
                    desc="Get instant AI analysis of your legal situation and potential outcomes."
                />
                <ServiceCard
                    icon={<FileText size={32} />}
                    title="Document Review"
                    desc="Upload legal documents for summary and key clause extraction."
                />
                <ServiceCard
                    icon={<Scale size={32} />}
                    title="Rights & Laws"
                    desc="Understand your fundamental rights and relevant IPC sections."
                />
            </div>

            {/* Statistics Row (Mock Data for Gov feel) */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <StatItem label="Consultations" value="1.2 Lakh+" />
                <StatItem label="Success Rate" value="94%" />
                <StatItem label="Languages" value="14" />
                <StatItem label="Active Agents" value="24/7" />
            </section>
        </div>
    );
};

// Helper Components
const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-start gap-4 cursor-pointer hover:border-gov-blue">
        <div className="p-3 bg-blue-50 text-gov-blue rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const StatItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-2xl md:text-3xl font-bold text-gov-blue">{value}</span>
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
    </div>
);
