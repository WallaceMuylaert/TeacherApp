import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />

            <div className="glass-card max-w-lg w-full p-12 relative z-10 text-center animate-slide-up border border-white/10 shadow-2xl shadow-black/50">
                <div className="flex justify-center mb-8 relative">
                    <div className="relative">
                        <Ghost size={80} className="text-primary animate-float" strokeWidth={1.5} />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    </div>
                </div>

                <h1 className="text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-white mb-4">Página Não Encontrada</h2>

                <p className="text-text-muted mb-8 leading-relaxed">
                    Ops! Parece que você se perdeu no espaço. A página que você está procurando não existe ou sua sessão expirou.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 font-bold hover:scale-105 active:scale-95"
                    >
                        <Home size={18} />
                        Ir para Início
                    </button>
                </div>
            </div>
        </div>
    );
};
