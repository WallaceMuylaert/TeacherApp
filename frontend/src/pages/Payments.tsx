import { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    parent_name?: string;
    parent_phone?: string;
}

interface Payment {
    id: number;
    student_id: number;
    month: number;
    year: number;
    status: string; // 'PENDING', 'PAID', 'LATE'
    amount: number;
}

export const Payments = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    // Notification
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, paymentsRes] = await Promise.all([
                api.get('/students/'),
                api.get(`/payments/?year=${selectedYear}&month=${selectedMonth}`)
            ]);
            setStudents(studentsRes.data);
            setPayments(paymentsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleTogglePayment = async (studentId: number, currentStatus: string, paymentId?: number) => {
        const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
        try {
            if (paymentId) {
                await api.put(`/payments/${paymentId}/status?status=${newStatus}`);
            } else {
                await api.post('/payments/', {
                    student_id: studentId,
                    month: selectedMonth,
                    year: selectedYear,
                    amount: 0,
                    status: newStatus,
                    paid_at: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : null
                });
            }
            // Optimistic update or refresh
            fetchData();
            showToast('Pagamento atualizado!', 'success');
        } catch (e) {
            showToast('Erro ao atualizar', 'error');
        }
    };

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Calculate stats
    const totalStudents = students.length;

    // Note: payments array only contains records that exist. If a student has no record, they are essentially PENDING (or not generated).
    // The previous logic implies creating a record on toggle. So we must count intersections.
    // Actually, visually we should show all students.

    // Better Paid Count: match student IDs
    const paidStudentIds = payments.filter(p => p.status === 'PAID').map(p => p.student_id);
    const actualPaidCount = students.filter(s => paidStudentIds.includes(s.id)).length;
    const pendingCount = totalStudents - actualPaidCount;
    const progress = totalStudents > 0 ? (actualPaidCount / totalStudents) * 100 : 0;

    return (
        <div className="animate-fade-in relative">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl animate-slide-in text-white font-medium ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-success" size={32} /> Financeiro
                    </h1>
                    <p className="text-text-muted mt-1">Controle de mensalidades de todos os alunos.</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 bg-bg-card p-2 rounded-xl border border-white/5">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary">
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted uppercase font-bold">Total Alunos</p>
                        <p className="text-2xl font-bold text-white">{totalStudents}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-success">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted uppercase font-bold">Pagos</p>
                        <p className="text-2xl font-bold text-white">{actualPaidCount}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-warning">
                    <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted uppercase font-bold">Pendentes</p>
                        <p className="text-2xl font-bold text-white">{pendingCount}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-white">Relatório de {selectedMonth}/{selectedYear}</h3>
                    <div className="w-1/3 bg-bg-dark rounded-full h-2 overflow-hidden border border-white/10">
                        <div className="bg-success h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Aluno</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Responsável</th>
                                <th className="text-center p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                                <th className="text-right p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.sort((a, b) => a.name.localeCompare(b.name)).map(student => {
                                const payment = payments.find(p => p.student_id === student.id);
                                const isPaid = payment?.status === 'PAID';
                                return (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{student.name}</td>
                                        <td className="p-4">
                                            <div className="text-sm text-text-muted">{student.parent_name || '-'}</div>
                                            <div className="text-xs opacity-50">{student.parent_phone}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isPaid ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning'}`}>
                                                {isPaid ? 'PAGO' : 'PENDENTE'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleTogglePayment(student.id, payment?.status || 'PENDING', payment?.id)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isPaid
                                                    ? 'bg-transparent border border-white/20 text-text-muted hover:border-danger hover:text-danger hover:bg-danger/10'
                                                    : 'bg-success text-white hover:bg-success-hover shadow-lg shadow-success/20'
                                                    }`}
                                            >
                                                {isPaid ? 'Desmarcar' : 'Confirmar Pagamento'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && !loading && (
                                <tr><td colSpan={4} className="p-8 text-center text-text-muted">Nenhum aluno cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
