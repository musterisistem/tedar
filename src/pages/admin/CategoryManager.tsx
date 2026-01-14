import React, { useState, useRef, useEffect } from 'react';
import { useCategories } from '../../context/CategoryContext';
import {
    Plus, Edit, Trash2, GripVertical, Save, X, CornerDownRight,
    // Explicitly import ONLY the icons we will use. No "import * as Icons"
    Briefcase, PenTool, Watch, Coffee, Gift, Monitor, Gamepad2, Sparkles, Gem,
    LayoutGrid, ChevronRight, Check, FolderPlus, Info,
    Home, ShoppingCart, Truck, Heart, User, Star, Settings, Tag, Image,
    Smartphone, Laptop, Headphones, Camera, Printer, Scissors,
    Utensils, Droplet, Sun, Moon, Umbrella
} from 'lucide-react';

// --- SAFE ICON SYSTEM ---
// We map string keys to the actual imported components.
// This prevents the "import * as Icons" crash.
const SAFE_ICON_MAP: { [key: string]: any } = {
    'LayoutGrid': LayoutGrid,
    'Briefcase': Briefcase,
    'PenTool': PenTool,
    'Watch': Watch,
    'Coffee': Coffee,
    'Gift': Gift,
    'Monitor': Monitor,
    'Gamepad2': Gamepad2,
    'Sparkles': Sparkles,
    'Gem': Gem,
    'Home': Home,
    'ShoppingCart': ShoppingCart,
    'Truck': Truck,
    'Heart': Heart,
    'User': User,
    'Star': Star,
    'Settings': Settings,
    'Tag': Tag,
    'Image': Image,
    'Smartphone': Smartphone,
    'Laptop': Laptop,
    'Headphones': Headphones,
    'Camera': Camera,
    'Printer': Printer,
    'Scissors': Scissors,
    'Utensils': Utensils,
    'Droplet': Droplet,
    'Sun': Sun,
    'Moon': Moon,
    'Umbrella': Umbrella
};

export const CategoryManager: React.FC = () => {
    const { categories, reorderCategories, updateCategory, addCategory, deleteCategory } = useCategories();

    // Selection State
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Derived state - safe fallback
    const selectedCategory = categories.find(c => c.id === selectedId) || null;

    // Form State
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('LayoutGrid');
    const [newSubcategory, setNewSubcategory] = useState('');
    const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
    const [editingSubName, setEditingSubName] = useState('');

    // Drag State
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Sync form with selection
    useEffect(() => {
        if (selectedCategory) {
            setName(selectedCategory.name);
            setIcon(selectedCategory.icon || 'LayoutGrid');
        } else {
            setName('');
            setIcon('LayoutGrid');
        }
    }, [selectedCategory]); // Ref changes only

    const handleAddMain = () => {
        const newId = `cat-${Date.now()}`;
        addCategory({
            id: newId,
            name: 'Yeni Kategori',
            icon: 'LayoutGrid',
            subcategories: []
        });
        setSelectedId(newId);
    };

    const handleDeleteMain = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
            deleteCategory(id);
            if (selectedId === id) setSelectedId(null);
        }
    };

    const handleSaveDetails = () => {
        if (!selectedId) return;
        updateCategory(selectedId, {
            name: name,
            icon: icon
        });
    };

    const handleAddSubcategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !selectedCategory || !newSubcategory.trim()) return;

        updateCategory(selectedId, {
            subcategories: [...selectedCategory.subcategories, newSubcategory.trim()]
        });
        setNewSubcategory('');
    };

    const handleDeleteSubcategory = (index: number) => {
        if (!selectedId || !selectedCategory) return;
        const newSubs = [...selectedCategory.subcategories];
        newSubs.splice(index, 1);
        updateCategory(selectedId, { subcategories: newSubs });
    };

    // --- Drag & Drop ---

    const onDragStart = (e: React.DragEvent, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const onDragEnter = (e: React.DragEvent, index: number) => {
        dragOverItem.current = index;
        e.preventDefault();
    };

    const onDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const copyList = [...categories];
            const item = copyList[dragItem.current];
            copyList.splice(dragItem.current, 1);
            copyList.splice(dragOverItem.current, 0, item);
            reorderCategories(copyList);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
        const IconComponent = SAFE_ICON_MAP[iconName] || LayoutGrid;
        return <IconComponent className={className} />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <LayoutGrid className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Kategori Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Site menü yapısını ve kategorileri yönetin.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[650px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* LEFT PANE: List */}
                <div className="w-full lg:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <span className="font-bold text-slate-700 text-sm">Kategoriler</span>
                        <button
                            onClick={handleAddMain}
                            className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <Plus className="w-3 h-3" /> Ekle
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {categories.map((cat, index) => (
                            <div
                                key={cat.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragEnter={(e) => onDragEnter(e, index)}
                                onDragEnd={onDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => setSelectedId(cat.id)}
                                className={`
                                    group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                    ${selectedId === cat.id
                                        ? 'bg-blue-50 border-blue-200 shadow-sm z-10 relative'
                                        : 'bg-white border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'}
                                `}
                            >
                                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <div className={`p-2 rounded-lg transition-colors ${selectedId === cat.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {renderIcon(cat.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-semibold text-sm truncate ${selectedId === cat.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {cat.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {cat.subcategories.length} Alt Kategori
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => handleDeleteMain(cat.id, e)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <ChevronRight className={`w-4 h-4 text-slate-300 transition-opacity ${selectedId === cat.id ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            </div>
                        ))}

                        {categories.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                                <Info className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-slate-400 text-sm">Listeniz boş.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANE: Detail */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {selectedCategory ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 bg-white">
                                <div className="flex flex-col gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori Adı</label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-lg text-slate-800 transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSaveDetails}
                                                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95 transform duration-100"
                                            >
                                                <Save className="w-4 h-4" />
                                                <span className="font-bold text-sm">Kaydet</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Icon Grid */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">İkon Seçimi</label>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                            {Object.keys(SAFE_ICON_MAP).map(iconKey => {
                                                const isActive = icon === iconKey;
                                                return (
                                                    <button
                                                        key={iconKey}
                                                        onClick={() => { setIcon(iconKey); updateCategory(selectedCategory.id, { icon: iconKey }); }}
                                                        className={`
                                                            group relative p-2.5 rounded-lg border transition-all duration-200
                                                            ${isActive
                                                                ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md'
                                                                : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                                                        `}
                                                        title={iconKey}
                                                    >
                                                        {renderIcon(iconKey, "w-5 h-5")}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subcategories */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div className="p-6 pb-0">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
                                        <CornerDownRight className="w-5 h-5 text-blue-500" />
                                        Alt Kategoriler
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{selectedCategory.subcategories.length}</span>
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                                    {selectedCategory.subcategories.map((sub, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 pl-4 rounded-xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                            <span className="w-6 h-6 flex items-center justify-center bg-white text-slate-400 rounded-md text-xs font-mono font-bold shadow-sm border border-slate-100">
                                                {idx + 1}
                                            </span>

                                            {editingSubIndex === idx ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingSubName}
                                                        onChange={(e) => setEditingSubName(e.target.value)}
                                                        className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (!selectedId || !selectedCategory) return;
                                                            const newSubs = [...selectedCategory.subcategories];
                                                            newSubs[idx] = editingSubName;
                                                            updateCategory(selectedId, { subcategories: newSubs });
                                                            setEditingSubIndex(null);
                                                        }}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="Kaydet"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingSubIndex(null)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="İptal"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="flex-1 font-semibold text-slate-700">{sub}</span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingSubIndex(idx);
                                                                setEditingSubName(sub);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Düzenle"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSubcategory(idx)}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
                                                            title="Sil"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    {selectedCategory.subcategories.length === 0 && (
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                            <FolderPlus className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">Henüz alt kategori yok.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50">
                                    <form onSubmit={handleAddSubcategory} className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newSubcategory}
                                                onChange={(e) => setNewSubcategory(e.target.value)}
                                                placeholder="Yeni alt kategori..."
                                                className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium shadow-sm"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newSubcategory.trim()}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-bold text-sm shadow-lg shadow-blue-200"
                                        >
                                            Ekle
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 bg-slate-50/50">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <LayoutGrid className="w-10 h-10 text-slate-200" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">Kategori Seçin</h2>
                            <p className="text-slate-500 text-center max-w-sm">
                                Düzenleme yapmak için sol menüden bir kategori seçin.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
};
