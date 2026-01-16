import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { Save, X, Upload, Trash2, X as CloseIcon, Youtube, CheckSquare } from 'lucide-react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';

export const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addProduct, products, updateProduct, brands, deleteReview } = useProducts();

    const currentProduct = products.find(p => p.id.toString() === id?.toString());

    const isEditMode = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const [priceCurrent, setPriceCurrent] = useState('');
    const [priceOriginal, setPriceOriginal] = useState('');
    const [discount, setDiscount] = useState('');
    const [stock, setStock] = useState('');
    const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
    const { categories: allCategories } = useCategories();
    const [color, setColor] = useState('');
    const [shippingCost, setShippingCost] = useState('');
    const [shippingInfo, setShippingInfo] = useState('');
    const [shippingType, setShippingType] = useState('');
    const [size, setSize] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    // Advanced State
    const [images, setImages] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [relatedProductIds, setRelatedProductIds] = useState<(string | number)[]>([]);
    const [relatedSearch, setRelatedSearch] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [sameDayShipping, setSameDayShipping] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Load Data if Edit Mode
    useEffect(() => {
        if (isEditMode && products) {
            const productToEdit = products.find(p => p.id.toString() === id);
            if (productToEdit) {
                setName(productToEdit.name);
                setCode(productToEdit.code || '');
                setBrand(productToEdit.brand || '');
                setDescription(productToEdit.description);
                setPriceCurrent(productToEdit.price.current.toString());
                setPriceOriginal(productToEdit.price.original.toString());
                setDiscount(productToEdit.discount ? productToEdit.discount.toString() : '0');
                setStock(productToEdit.stock.toString());
                setCategoriesSelected(productToEdit.categories || []);
                setImages(productToEdit.images || []);
                setTags(productToEdit.tags || []);
                setIsActive(productToEdit.isActive ?? true);
                // Specs
                setColor(productToEdit.specs?.color || '');
                setSize(productToEdit.specs?.size || '');
                setShippingType(productToEdit.specs?.shippingType || '');
                setShippingInfo(productToEdit.shipping?.info || '');
                setShippingCost(productToEdit.shipping?.cost?.toString() || '');
                setVideoUrl(productToEdit.videoUrl || '');
                setRelatedProductIds(productToEdit.relatedProductIds || []);
                setSameDayShipping(productToEdit.sameDayShipping ?? false);
            }
        }
    }, [isEditMode, id, products]);

    const toggleCategory = (catName: string) => {
        setCategoriesSelected(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
    };

    // Image Handling
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const newImages = Array.from(e.dataTransfer.files).map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const setCoverImage = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            const [selected] = newImages.splice(index, 1);
            newImages.unshift(selected);
            return newImages;
        });
    };

    // Tag Handling
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name || !priceCurrent || !stock) {
            alert('Lütfen zorunlu alanları doldurunuz (Ad, Fiyat, Stok).');
            return;
        }

        const productData = {
            id: isEditMode ? id : Date.now(),
            name,
            code: code || `PRD-${Date.now()}`,
            brand: brand || 'Generic',
            description,
            price: {
                current: Number(priceCurrent.toString().replace(/,/g, '')),
                original: priceOriginal ? Number(priceOriginal.toString().replace(/,/g, '')) : Number(priceCurrent.toString().replace(/,/g, '')),
                discount: discount ? Number(discount) : 0,
                currency: 'TL'
            },
            stock: Number(stock),
            categories: categoriesSelected,
            image: images[0] || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'],
            specs: {
                color: color || '',
                size: size || '',
                shippingType: shippingType || 'Standart'
            },
            shipping: {
                cost: shippingCost ? Number(shippingCost.toString().replace(/,/g, '')) : 0,
                info: shippingInfo || '1-3 iş günü',
            },
            rating: isEditMode ? (products.find(p => p.id.toString() === id)?.rating || 0) : 0,
            reviews: isEditMode ? (products.find(p => p.id.toString() === id)?.reviews || 0) : 0,
            badges: [],
            tags: tags,
            isActive,
            videoUrl: videoUrl || undefined,
            relatedProductIds: relatedProductIds.length > 0 ? relatedProductIds : undefined,
            sameDayShipping: sameDayShipping
        };

        if (isEditMode) {
            await updateProduct(id!, productData);
        } else {
            await addProduct(productData as any);
        }
        navigate('/admin/products/list');
    };

    return (
        <form onSubmit={handleSubmit} className="w-full mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{isEditMode ? 'Ürünü Düzenle' : 'Ürün Ekle'}</h1>
                    <p className="text-slate-500 mt-1">{isEditMode ? 'Mevcut ürün bilgilerini güncelleyin.' : 'Yeni bir ürünü kataloğa ekleyin ve yönetin.'}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products/list')}
                        className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <X className="w-4 h-4" />
                        İptal
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet ve Yayınla
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Temel Bilgiler</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ürün Adı <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Örn: Ergonomik Ofis Koltuğu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama</label>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                />
                                <p className="text-xs text-slate-400 mt-2">Görsel düzenleyici ile ürününüzü detaylıca tanıtın. İsterseniz HTML kodunu da düzenleyebilirsiniz.</p>
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Ürün Görselleri</h2>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {images.length} görsel eklendi
                            </span>
                        </div>

                        {/* Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-6 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-6 h-6 text-slate-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Görselleri buraya sürükleyin veya seçin</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF (Max 5MB)</p>
                        </div>

                        {/* Image List */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />

                                        {/* Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="p-1.5 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {idx !== 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverImage(idx)}
                                                    className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-full shadow hover:bg-slate-50 transition-colors"
                                                >
                                                    Vitrin Yap
                                                </button>
                                            )}
                                        </div>

                                        {/* Cover Badge */}
                                        {idx === 0 && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                VİTRİN
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {images.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Henüz görsel eklenmedi.
                            </div>
                        )}
                    </div>

                    {/* Video Section (NEW) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Ürün Videosu</h2>
                            <Youtube className="w-5 h-5 text-red-600" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Video (YouTube Embed Kodu veya Link)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all font-mono"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe> veya https://youtu.be/...'
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                YouTube videosunun "Yerleştir (Embed)" kodunu veya direkt linkini buraya yapıştırabilirsiniz.
                            </p>
                        </div>
                    </div>

                    {/* Related Products Selection */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Benzer Ürünler (İlgili Ürünler)</h2>

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Ürün Ara..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
                                    value={relatedSearch}
                                    onChange={(e) => setRelatedSearch(e.target.value)}
                                />
                                <div className="h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 custom-scrollbar">
                                    {products
                                        .filter(p => p.id.toString() !== id && (p.name.toLowerCase().includes(relatedSearch.toLowerCase()) || String(p.code || '').toLowerCase().includes(relatedSearch.toLowerCase())))
                                        .map(p => (
                                            <div key={p.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer" onClick={() => {
                                                if (relatedProductIds.includes(p.id)) {
                                                    setRelatedProductIds(prev => prev.filter(pid => pid !== p.id));
                                                } else {
                                                    setRelatedProductIds(prev => [...prev, p.id]);
                                                }
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={relatedProductIds.includes(p.id)}
                                                    onChange={() => { }} // Handle click on div
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-slate-200" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.code || 'SKU Yok'}</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Seçili ürünler "İlgili Ürünler" kısmında gösterilecektir. Seçim yapılmazsa otomatik olarak aynı kategoriden ürünler gösterilir.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings (1/3 width) */}
                <div className="space-y-8">
                    {/* Pricing & Stock */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Fiyat & Stok</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Satış Fiyatı (TL) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-8 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                                        value={priceCurrent}
                                        onChange={(e) => setPriceCurrent(e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-4 text-sm font-bold text-slate-400">₺</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Liste Fiyatı</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        value={priceOriginal}
                                        onChange={(e) => setPriceOriginal(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Stok</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ürün Kodu (SKU)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm uppercase font-mono tracking-wider focus:outline-none focus:border-blue-500"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="SKU-001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Detaylar</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Kategoriler</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto custom-scrollbar">
                                    {allCategories.map(cat => (
                                        <div key={cat.id} className="mb-4 last:mb-0">
                                            <label className="flex items-center gap-2 cursor-pointer group mb-2">
                                                <div
                                                    onClick={() => toggleCategory(cat.name)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${categoriesSelected.includes(cat.name) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}
                                                >
                                                    {categoriesSelected.includes(cat.name) && <CheckSquare className="w-4 h-4 text-white" />}
                                                </div>
                                                <span className={`text-sm font-bold ${categoriesSelected.includes(cat.name) ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {cat.name}
                                                </span>
                                            </label>

                                            {cat.subcategories && cat.subcategories.length > 0 && (
                                                <div className="ml-6 space-y-2 border-l-2 border-slate-200 pl-4 mt-1">
                                                    {cat.subcategories.map(sub => (
                                                        <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                                                            <div
                                                                onClick={() => toggleCategory(sub)}
                                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${categoriesSelected.includes(sub) ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}
                                                            >
                                                                {categoriesSelected.includes(sub) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <span className={`text-xs font-medium ${categoriesSelected.includes(sub) ? 'text-blue-600' : 'text-slate-500'}`}>
                                                                {sub}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic">Birden fazla kategori seçebilirsiniz.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Marka</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                >
                                    <option value="">İsimsiz Marka (Generic)</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Etiketler</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-400 transition-all">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map((tag, idx) => (
                                            <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><CloseIcon className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent text-sm focus:outline-none px-1"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Etiket ekleyip Enter'a basın..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Teknik Detaylar</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ürün Rengi</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="Örn: Siyah, Mavi..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Sevkiyat Tipi</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={shippingType}
                                    onChange={(e) => setShippingType(e.target.value)}
                                    placeholder="Örn: Standart, Hızlı..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Boyut / Ebat</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    placeholder="Örn: A4, 15.6 inç, 50x70..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-bold text-slate-800">Yayın Durumu</h2>
                            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        </div>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                            value={isActive ? 'active' : 'passive'}
                            onChange={(e) => setIsActive(e.target.value === 'active')}
                        >
                            <option value="active">Yayında (Aktif)</option>
                            <option value="passive">Taslak (Pasif)</option>
                        </select>
                    </div>

                    {/* Aynı Gün Kargo */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Aynı Gün Kargo</h2>
                                <p className="text-xs text-slate-500 mt-1">Saat 11:00'e kadar yapılan siparişler aynı gün kargoya verilir</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSameDayShipping(!sameDayShipping)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sameDayShipping ? 'bg-orange-500' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${sameDayShipping ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        {sameDayShipping && (
                            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700 font-medium">
                                ⚡ Bu ürün için "Bugün Kargoda" bildirimi gösterilecek
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section - Full Width at Bottom */}
                {isEditMode && currentProduct && currentProduct.reviewItems && currentProduct.reviewItems.length > 0 && (
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Ürün Yorumları
                                    <span className="ml-2 text-sm font-normal text-slate-500">
                                        ({currentProduct.reviewItems.length})
                                    </span>
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {currentProduct.reviewItems.map((review, index) => (
                                    <div key={index} className="p-6 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="font-bold text-slate-800">{review.user}</div>
                                                <div className="flex items-center text-yellow-500 text-sm">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating ? "fill-current" : "text-gray-300"}>★</span>
                                                    ))}
                                                </div>
                                                <div className="text-slate-400 text-xs px-2 py-0.5 bg-slate-100 rounded-full">{review.date}</div>
                                                {review.hasPhoto && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                                        Fotoğraflı Yorum
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">"{review.comment}"</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => deleteReview(currentProduct.id, index)}
                                            className="group flex flex-col items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            title="Yorumu Sil"
                                        >
                                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-medium">Sil</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};
