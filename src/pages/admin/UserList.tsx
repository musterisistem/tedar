import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { Search, Filter, Edit, Trash2, Shield, ShieldOff } from 'lucide-react';

export const UserList: React.FC = () => {
    const navigate = useNavigate();
    const { users, deleteUser, blockUser } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const filteredUsers = (users || []).filter(user => {
        if (!user) return false;
        const term = searchTerm.toLowerCase();
        const name = (user.name || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        const email = (user.email || '').toLowerCase();

        const matchesSearch = name.includes(term) ||
            username.includes(term) ||
            email.includes(term);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="w-full mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Kullanıcılar</h1>
                    <p className="text-slate-500 mt-1">Kayıtlı üyeleri yönetin ve görüntüleyin.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="İsim, kullanıcı adı veya e-posta ara..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrele
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kullanıcı</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İletişim</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Adresi</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                                                {(user.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                                                <div className="text-xs text-slate-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{user.email}</div>
                                        <div className="text-xs text-slate-400">Kayıt: {user.registerDate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">{user.ipAddress}</code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.status === 'active' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                Engelli
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className={`p-1.5 rounded transition-colors ${user.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.status === 'active' ? 'Engelle' : 'Engeli Kaldır'}
                                                onClick={() => blockUser(user.id)}
                                            >
                                                {user.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                            </button>
                                            <button
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Düzenle / Detay"
                                                // Link to detail page will go here
                                                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Sil"
                                                onClick={() => {
                                                    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
                                                        deleteUser(user.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
