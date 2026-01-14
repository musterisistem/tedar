import React, { useState, useMemo } from 'react';
import { useProducts, type Product } from '../../context/ProductContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trash2, CheckSquare, Square, Filter } from 'lucide-react';

export const ProductList: React.FC = () => {
    const { products, deleteProduct, deleteBulkProducts, updateProduct } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter((product: Product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [products, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Handlers
    const handleDelete = (id: string | number) => {
        if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            deleteProduct(id);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        if (window.confirm(`${selectedIds.size} adet ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            await deleteBulkProducts(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const toggleStatus = (product: Product) => {
        updateProduct(product.id, { isActive: !product.isActive });
    };

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0) {
            // Deselect all on this page
            const newSelected = new Set(selectedIds);
            paginatedProducts.forEach(p => newSelected.delete(p.id.toString()));
            setSelectedIds(newSelected);
        } else {
            // Select all on this page
            const newSelected = new Set(selectedIds);
            paginatedProducts.forEach(p => newSelected.add(p.id.toString()));
            setSelectedIds(newSelected);
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const isAllSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id.toString()));

    return (
        <div className="w-full pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Ürün Listesi</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Toplam <span className="font-bold text-slate-800">{products.length}</span> ürün bulunmaktadır.
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors rounded-md flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Seçilenleri Sil ({selectedIds.size})
                        </button>
                    )}
                    <Link to="/admin/products/add" className="bg-blue-700 text-white px-6 py-2 text-sm font-medium hover:bg-blue-600 transition-colors rounded-md flex items-center">
                        + Yeni Ürün Ekle
                    </Link>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-slate-50 p-4 border border-slate-200 mb-6 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ürün adı veya kodu ara..."
                        className="w-full bg-white border border-slate-300 pl-10 pr-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Göster:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-white border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={filteredProducts.length}>Tümü</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 w-10 text-center">
                                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                                        {isAllSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3">ID / Kod</th>
                                <th className="px-4 py-3">Görsel</th>
                                <th className="px-4 py-3">Ürün Adı</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3">Stok</th>
                                <th className="px-4 py-3">Fiyat</th>
                                <th className="px-4 py-3">Durum</th>
                                <th className="px-4 py-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedProducts.map((product: Product) => {
                                const isSelected = selectedIds.has(product.id.toString());
                                return (
                                    <tr key={product.id} className={`hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => toggleSelect(product.id.toString())}>
                                                {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                                            {product.code || product.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden bg-white">
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate" title={product.name}>
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {product.categories?.slice(0, 2).join(', ') || 'Kategorisiz'}
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${product.stock < 10 ? 'text-red-600' : 'text-slate-600'}`}>
                                            {product.stock}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-slate-800">
                                            {product.price.current.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className={`px-2 py-1 text-[10px] font-bold border rounded ${product.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                            >
                                                {product.isActive ? 'AKTİF' : 'PASİF'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <Link to={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:underline">Düzenle</Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {paginatedProducts.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            {searchTerm ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Henüz ürün eklenmemiş.'}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-sm text-slate-500 hidden md:block">
                            Toplam <span className="font-bold">{filteredProducts.length}</span> üründen <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> arası gösteriliyor.
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Simple Page Numbers (First, Last, Current) */}
                            <div className="flex items-center gap-1 px-2">
                                <span className="text-sm font-medium text-slate-700">Sayfa {currentPage} / {totalPages}</span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
