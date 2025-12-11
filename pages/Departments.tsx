import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Department } from '../types';
import { Trash2, Edit2, Plus, X } from 'lucide-react';

export const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAllDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingId) {
                await api.updateDepartment(editingId, formData);
            } else {
                await api.createDepartment(formData);
            }
            setIsModalOpen(false);
            loadDepartments();
            setFormData({ name: '', code: '' });
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        }
    };

    const handleEdit = (dept: Department) => {
        setFormData({ name: dept.name, code: dept.code });
        setEditingId(dept.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;
        try {
            await api.deleteDepartment(id);
            loadDepartments();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openNewModal = () => {
        setFormData({ name: '', code: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Phòng ban</h1>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> Thêm phòng ban
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Mã phòng ban</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tên phòng ban</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 w-32">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-blue-600">{dept.code}</td>
                                <td className="px-6 py-4 text-gray-900">{dept.name}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(dept)}
                                        className="p-1 text-gray-500 hover:text-blue-600 rounded"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept.id)}
                                        className="p-1 text-gray-500 hover:text-red-600 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {departments.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Chưa có phòng ban nào</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{editingId ? 'Sửa thông tin' : 'Thêm mới phòng ban'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã phòng ban</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: IT, HR, SALES"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng ban</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: Phòng Công nghệ Thông tin"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
