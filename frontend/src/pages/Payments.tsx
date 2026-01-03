import { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { formatCurrency, parseCurrency } from '../utils/masks';
import { Loading } from '../components/Loading';

interface Student {
    id: number;
    name: string;
    parent_name?: string;
    parent_phone?: string;
    school_year?: string;
    class_type?: string;
}

interface Payment {
    id: number;
    student_id: number;
    month: number;
    year: number;
    status: string; // 'PENDING', 'PAID', 'LATE'
    amount: number;
}

interface PaymentInput {
    student_id: number;
    status: string;
    amount: number;
    id?: number;
    paid_at?: string | null;
}

export const Payments = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [allStudentIds, setAllStudentIds] = useState<number[]>([]); // For stats
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    // Search and Pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [limit] = useState(10);

    // Local State for Batch Edits
    const [localPayments, setLocalPayments] = useState<Record<number, PaymentInput>>({});
    const [saving, setSaving] = useState(false);

    // Notification
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedMonth, selectedYear, search, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const skip = page * limit;

            // 1. Fetch paginated students for the table
            const studentsRes = await api.get(`/students/?skip=${skip}&limit=${limit}&search=${search}`);

            // 2. Fetch ALL students for accurate Stats (Total & Pending)
            // We use a high limit to ensure we get everyone to count correctly.
            const allStudentsRes = await api.get(`/students/?limit=1000`);

            // 3. Fetch ALL payments for the month (limit 1000)
            const paymentsRes = await api.get(`/payments/?year=${selectedYear}&month=${selectedMonth}&limit=1000`);

            setStudents(studentsRes.data);
            setAllStudentIds(allStudentsRes.data.map((s: Student) => s.id));
            setPayments(paymentsRes.data);

            // Initialize Local State for current page students
            const initialPayments: Record<number, PaymentInput> = {};
            studentsRes.data.forEach((s: Student) => {
                const existing = paymentsRes.data.find((p: Payment) => p.student_id === s.id);
                initialPayments[s.id] = existing ? {
                    ...existing,
                    amount: existing.amount || 0
                } : {
                    student_id: s.id,
                    status: 'PENDING',
                    amount: 0
                };
            });
            setLocalPayments(initialPayments);

        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateLocalPayment = (studentId: number, field: keyof PaymentInput, value: any) => {
        setLocalPayments(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    const handleSavePayments = async () => {
        setSaving(true);
        try {
            const updates = Object.values(localPayments);
            await Promise.all(updates.map(async (p) => {
                // Only save if it's one of the currently visible students to avoid accidental overwrites?
                // Actually we only populate localPayments with current page.

                const payload = {
                    student_id: p.student_id,
                    month: selectedMonth,
                    year: selectedYear,
                    status: p.status,
                    amount: Number(p.amount),
                    paid_at: p.status === 'PAID' ? new Date().toISOString().split('T')[0] : null
                };

                if (p.id) {
                    await api.put(`/payments/${p.id}`, payload);
                } else {
                    await api.post('/payments/', payload);
                }
            }));

            showToast('Pagamentos salvos com sucesso!', 'success');
            fetchData();
        } catch (e) {
            console.error(e);
            showToast('Erro ao salvar pagamentos', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Calculate stats (based on ALL students, not just current page)
    const totalStudents = allStudentIds.length;

    // Paid Count: Payment is PAID AND belongs to a valid student
    const actualPaidCount = payments.filter(p =>
        p.status === 'PAID' && allStudentIds.includes(p.student_id)
    ).length;

    const pendingCount = totalStudents - actualPaidCount;




    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Note: To restore accurate stats, we might need a separate call.
    // For now, let's assume visual correctness of the list is priority.

    const handleExportReport = async () => {
        try {
            const res = await api.post(`/payments/report/docx?month=${selectedMonth}&year=${selectedYear}`, {}, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Financeiro_${selectedMonth}_${selectedYear}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            showToast('Erro ao gerar relatório', 'error');
        }
    };

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
                    <p className="text-text-muted mt-1">Controle de mensalidades.</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 bg-bg-card p-2 rounded-xl border border-white/5">
                    <button
                        onClick={handleExportReport}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <DollarSign size={16} /> Exportar Relatório
                    </button>
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

            {/* Search Bar */}
            <div className="bg-bg-card border border-white/5 rounded-xl p-4 mb-6 sticky top-0 z-10 shadow-xl backdrop-blur-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        className="w-full bg-bg-dark border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-muted/50 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg-card/60 backdrop-blur-sm rounded-xl">
                        <Loading text="Carregando financeiro..." />
                    </div>
                )}
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-white">Relatório de {selectedMonth}/{selectedYear}</h3>
                    <button
                        onClick={handleSavePayments}
                        disabled={saving}
                        className={`
                             bg-gradient-to-r from-success to-success-hover text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-success/25 
                             transition-all flex items-center gap-2 text-sm
                             ${saving ? 'opacity-70 cursor-wait' : 'hover:shadow-success/40 hover:-translate-y-1 active:translate-y-0'}
                        `}
                    >
                        {saving ? 'Salvando...' : <><DollarSign size={16} /> Salvar Alterações</>}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Aluno</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Responsável</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Ano Escolar</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Tipo de Aula</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[180px]">Status</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[180px]">Valor Pago</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.map(student => {
                                const payment = localPayments[student.id] || { status: 'PENDING', amount: 0, student_id: student.id };
                                const isPaid = payment.status === 'PAID';
                                return (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium text-white">{student.name}</td>
                                        <td className="p-4">
                                            <div className="text-sm text-text-muted">{student.parent_name || '-'}</div>
                                            <div className="text-xs opacity-50">{student.parent_phone}</div>
                                        </td>
                                        <td className="p-4 text-left">{student.school_year || '-'}</td>
                                        <td className="p-4 text-left">{student.class_type || '-'}</td>
                                        <td className="p-4">
                                            <select
                                                className={`w-full p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary outline-none transition-colors cursor-pointer ${isPaid ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}
                                                value={payment.status}
                                                onChange={e => updateLocalPayment(student.id, 'status', e.target.value)}
                                            >
                                                <option value="PENDING">Pendente</option>
                                                <option value="PAID">Pago</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className={`w-full bg-transparent border-b outline-none py-1 text-sm font-mono transition-colors text-right ${isPaid
                                                        ? 'border-white/10 focus:border-primary text-white'
                                                        : 'border-transparent text-text-muted cursor-not-allowed'
                                                        }`}
                                                    value={formatCurrency(payment.amount)}
                                                    onChange={e => updateLocalPayment(student.id, 'amount', parseCurrency(e.target.value))}
                                                    disabled={!isPaid}
                                                    placeholder="R$ 0,00"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && !loading && (
                                <tr><td colSpan={6} className="p-8 text-center text-text-muted">Nenhum aluno encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center p-4 border-t border-white/5 bg-black/20">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                    >
                        Anterior
                    </button>
                    <span className="text-text-muted text-sm">Página {page + 1}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={students.length < limit}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
};
