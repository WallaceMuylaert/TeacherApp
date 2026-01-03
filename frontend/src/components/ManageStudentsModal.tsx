import React, { useState } from 'react';
import { X, Plus, Users, Search } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    phone?: string;
    parent_name?: string;
    parent_phone?: string;
    parent_email?: string;
    active?: boolean;
}

interface ManageStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[]; // All students in the system
    enrolledStudentIds: number[];
    onEnroll: (id: number) => void;
    onUnenroll: (id: number) => void;
}

export const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ isOpen, onClose, students, enrolledStudentIds, onEnroll, onUnenroll }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredStudents = students
        .filter(s => s.active !== false) // Show only active students (default true)
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up relative flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h3 className="text-xl mb-1 font-bold text-white flex items-center gap-2">
                    <Users size={20} className="text-primary" /> Gerenciar Alunos
                </h3>
                <p className="text-sm text-text-muted mb-6">Adicione ou remova alunos desta turma.</p>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        className="w-full bg-bg-dark/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredStudents.map(s => {
                        const isEnrolled = enrolledStudentIds.includes(s.id);
                        return (
                            <div key={s.id} className="p-3 rounded-lg bg-bg-dark/50 border border-white/5 flex justify-between items-center transition-colors hover:bg-white/5">
                                <div className="flex flex-col">
                                    <span className={`font-medium ${isEnrolled ? 'text-white' : 'text-text-muted'}`}>{s.name}</span>
                                    {isEnrolled && <span className="text-[10px] uppercase tracking-wider text-success font-bold">Matriculado</span>}
                                </div>

                                {isEnrolled ? (
                                    <button
                                        onClick={() => onUnenroll(s.id)}
                                        className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors text-xs font-bold flex items-center gap-1 group"
                                        title="Remover da turma"
                                    >
                                        <X size={14} className="group-hover:scale-110 transition-transform" /> Remover
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onEnroll(s.id)}
                                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold flex items-center gap-1 group"
                                        title="Adicionar à turma"
                                    >
                                        <Plus size={14} className="group-hover:scale-110 transition-transform" /> Adicionar
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {filteredStudents.length === 0 && (
                        <div className="text-center text-text-muted italic p-8 border border-dashed border-white/10 rounded-lg">
                            {searchTerm ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado no sistema.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
