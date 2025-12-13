import React, { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Search, Pencil, Trash, X, AlertTriangle, UserCircle } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    phone?: string;
    parent_name?: string;
    parent_phone?: string;
    parent_email?: string;
}

interface ClassModel {
    id: number;
    name: string;
}

export const Students = () => {
    const [students, setStudents] = useState<Student[]>([]);
    // const [filteredStudents, setFilteredStudents] = useState<Student[]>([]); // Removed: Server side filtering
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [limit] = useState(10); // Items per page
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStudentData, setNewStudentData] = useState({ name: '', phone: '', parent_name: '', parent_phone: '', parent_email: '' });
    const [selectedClassId, setSelectedClassId] = useState<number | ''>(''); // For enrollment

    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editStudentData, setEditStudentData] = useState({ name: '', phone: '', parent_name: '', parent_phone: '', parent_email: '' });

    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    // Debounce search and fetch
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, page]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const skip = page * limit;
            const res = await api.get(`/students/?skip=${skip}&limit=${limit}&search=${search}`);
            setStudents(res.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (e) { console.error(e); }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/students/', newStudentData);
            if (selectedClassId) {
                if (selectedClassId) {
                    await api.post(`/classes/${selectedClassId}/enroll/${res.data.id}`);
                }
            }
            setShowCreateModal(false);
            setNewStudentData({ name: '', phone: '', parent_name: '', parent_phone: '', parent_email: '' });
            setSelectedClassId('');
            fetchData();
        } catch (e) { alert('Erro ao criar aluno'); }
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        try {
            await api.put(`/students/${editingStudent.id}`, editStudentData);
            setEditingStudent(null);
            fetchData();
        } catch (e) { alert('Erro ao atualizar'); }
    };

    const handleDeleteStudent = async () => {
        if (!deletingStudent) return;
        try {
            await api.delete(`/students/${deletingStudent.id}`);
            setDeletingStudent(null);
            fetchData();
        } catch (e) { alert('Erro ao excluir'); }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <UserCircle className="text-primary" size={32} /> Alunos
                    </h1>
                    <p className="text-text-muted mt-1">Gerencie todos os alunos cadastrados.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
                >
                    <Plus size={20} /> Novo Aluno
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-bg-card border border-white/5 rounded-xl p-4 mb-6 sticky top-0 z-10 shadow-xl backdrop-blur-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome do aluno ou responsável..."
                        className="w-full bg-bg-dark border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-muted/50 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Nome</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Contato</th>
                                <th className="text-left p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Responsável</th>
                                <th className="text-right p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{student.name}</div>
                                    </td>
                                    <td className="p-4 text-text-muted text-sm">{student.phone || '-'}</td>
                                    <td className="p-4">
                                        <div className="text-sm text-white">{student.parent_name || '-'}</div>
                                        <div className="text-xs text-text-muted">{student.parent_phone}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingStudent(student);
                                                    setEditStudentData({
                                                        name: student.name,
                                                        phone: student.phone || '',
                                                        parent_name: student.parent_name || '',
                                                        parent_phone: student.parent_phone || '',
                                                        parent_email: student.parent_email || ''
                                                    });
                                                }}
                                                className="p-2 hover:bg-white/10 text-text-muted hover:text-white rounded-lg transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingStudent(student)}
                                                className="p-2 hover:bg-danger/20 text-text-muted hover:text-danger rounded-lg transition-colors"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-text-muted italic">Nenhum aluno encontrado.</td>
                                </tr>
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card w-full max-w-lg p-8 animate-slide-up relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-white"><X size={20} /></button>
                        <h3 className="text-2xl font-bold text-white mb-6">Novo Aluno</h3>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Nome Completo</label>
                                <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={newStudentData.name} onChange={e => setNewStudentData({ ...newStudentData, name: e.target.value })} required autoFocus />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Celular</label>
                                <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={newStudentData.phone} onChange={e => setNewStudentData({ ...newStudentData, phone: e.target.value })} placeholder="(99) 99999-9999" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Responsável</label>
                                    <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={newStudentData.parent_name} onChange={e => setNewStudentData({ ...newStudentData, parent_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Tel. Responsável</label>
                                    <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={newStudentData.parent_phone} onChange={e => setNewStudentData({ ...newStudentData, parent_phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Email Responsável</label>
                                <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={newStudentData.parent_email} onChange={e => setNewStudentData({ ...newStudentData, parent_email: e.target.value })} />
                            </div>

                            <div className="pt-2 border-t border-white/10 mt-2">
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Matricular na Turma (Opcional)</label>
                                <select
                                    className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={selectedClassId}
                                    onChange={e => setSelectedClassId(Number(e.target.value) || '')}
                                >
                                    <option value="">-- Selecione uma turma --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-text-muted hover:text-white">Cancelar</button>
                                <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card w-full max-w-lg p-8 animate-slide-up relative">
                        <button onClick={() => setEditingStudent(null)} className="absolute top-4 right-4 text-text-muted hover:text-white"><X size={20} /></button>
                        <h3 className="text-2xl font-bold text-white mb-6">Editar Aluno</h3>
                        <form onSubmit={handleUpdateStudent} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Nome Completo</label>
                                <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={editStudentData.name} onChange={e => setEditStudentData({ ...editStudentData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Celular</label>
                                <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={editStudentData.phone} onChange={e => setEditStudentData({ ...editStudentData, phone: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Responsável</label>
                                    <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={editStudentData.parent_name} onChange={e => setEditStudentData({ ...editStudentData, parent_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Tel. Responsável</label>
                                    <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={editStudentData.parent_phone} onChange={e => setEditStudentData({ ...editStudentData, parent_phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Email Responsável</label>
                                <input className="w-full p-3 bg-bg-dark/50 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={editStudentData.parent_email} onChange={e => setEditStudentData({ ...editStudentData, parent_email: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 text-text-muted hover:text-white">Cancelar</button>
                                <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-sm p-6 relative animate-slide-up border-danger/30">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center mb-4 text-danger"><AlertTriangle size={24} /></div>
                            <h3 className="text-xl font-bold text-white mb-2">Excluir Aluno?</h3>
                            <p className="text-text-muted mb-6">Tem certeza que deseja excluir <strong>{deletingStudent.name}</strong>? Esta ação é irreversível.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeletingStudent(null)} className="flex-1 py-2 text-text-muted hover:bg-white/5 rounded-lg">Cancelar</button>
                                <button onClick={handleDeleteStudent} className="flex-1 py-2 bg-danger hover:bg-danger-hover text-white rounded-lg">Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
