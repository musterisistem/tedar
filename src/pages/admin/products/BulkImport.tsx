import React, { useState } from 'react';
import Papa from 'papaparse';
import { useProducts, type Product } from '../../../context/ProductContext';
import { useCategories } from '../../../context/CategoryContext';
import { Upload, FileText, ArrowRight, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface CSVRow {
    [key: string]: string;
}

interface ColumnMapping {
    csvHeader: string;
    productField: keyof Product | 'custom_price_original' | 'custom_price_current' | 'custom_images' | 'custom_ignore' | 'specs_color' | 'specs_size' | 'specs_shippingType' | 'custom_category';
}

const PRODUCT_FIELDS: { value: string; label: string }[] = [
    { value: 'name', label: 'Ürün Adı' },
    { value: 'description', label: 'Açıklama' },
    { value: 'custom_price_current', label: 'Satış Fiyatı (TL)' },
    { value: 'custom_price_original', label: 'Liste Fiyatı' },
    { value: 'stock', label: 'Stok Adedi' },
    { value: 'brand', label: 'Marka' },
    { value: 'code', label: 'Ürün Kodu' },
    { value: 'specs_color', label: 'Ürün Rengi' },
    { value: 'specs_size', label: 'Boyut / Ebat' },
    { value: 'specs_shippingType', label: 'Sevkiyat Tipi' },
    { value: 'custom_category', label: 'Kategori İsmi' },
    { value: 'custom_images', label: 'Görseller (Virgülle Ayrılmış veya Tek Sütun)' },
    { value: 'custom_ignore', label: 'Görmezden Gel' },
];

export const BulkImport: React.FC = () => {
    const { addProduct, addBulkProducts, products } = useProducts();
    const { categories } = useCategories();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<CSVRow[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping[]>([]);
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map, 3: Preview/Import
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

    const processFile = (file: File) => {
        setFile(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            preview: 5000,
            complete: (results) => {
                const rows = results.data as CSVRow[];
                const csvHeaders = results.meta.fields || [];
                setParsedData(rows);
                setHeaders(csvHeaders);

                // Auto-map logic
                const initialMapping: ColumnMapping[] = csvHeaders.map(header => {
                    const lowerHeader = header.toLowerCase();
                    let field: any = 'custom_ignore';

                    if (lowerHeader.includes('ad') || lowerHeader.includes('name') || lowerHeader.includes('başlık')) field = 'name';
                    else if (lowerHeader.includes('açıklama') || lowerHeader.includes('desc')) field = 'description';
                    else if (lowerHeader.includes('satış fiyat') || (lowerHeader.includes('fiyat') && !lowerHeader.includes('piyasa'))) field = 'custom_price_current';
                    else if (lowerHeader.includes('piyasa') || lowerHeader.includes('liste') || lowerHeader.includes('indirimsiz')) field = 'custom_price_original';
                    else if (lowerHeader.includes('stok') || lowerHeader.includes('adet')) field = 'stock';
                    else if (lowerHeader.includes('marka')) field = 'brand';
                    else if (lowerHeader.includes('kod') || lowerHeader.includes('barkod')) field = 'code';
                    else if (lowerHeader.includes('renk')) field = 'specs_color';
                    else if (lowerHeader.includes('boyut') || lowerHeader.includes('ebat') || lowerHeader.includes('size')) field = 'specs_size';
                    else if (lowerHeader.includes('sevkiyat') || lowerHeader.includes('kargo')) field = 'specs_shippingType';
                    else if (lowerHeader.includes('kategori')) field = 'custom_category';
                    else if (lowerHeader.includes('görsel') || lowerHeader.includes('resim') || lowerHeader.includes('image')) field = 'custom_images';

                    return { csvHeader: header, productField: field };
                });
                setMapping(initialMapping);
                setStep(2);
            },
            error: (error) => {
                console.error('CSV Parse Error:', error);
                alert('CSV dosyası okunurken hata oluştu.');
            }
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
            processFile(droppedFile);
        }
    };

    const updateMapping = (index: number, field: string) => {
        const newMapping = [...mapping];
        newMapping[index].productField = field as any;
        setMapping(newMapping);
    };

    const processImport = async () => {
        setImporting(true);
        let successCount = 0;
        let failedCount = 0;

        try {
            const mappedProducts: Product[] = [];

            for (const row of parsedData) {
                const newProduct: any = {
                    id: Date.now() + Math.random(),
                    price: { currency: 'TL', current: 0, original: 0 },
                    images: [],
                    categories: [],
                    brand: 'Diğer',
                    rating: 0,
                    reviews: 0,
                    badges: [],
                    specs: { color: '', size: '', shippingType: '' },
                    isActive: true
                };

                mapping.forEach(map => {
                    const value = row[map.csvHeader];
                    if (!value || map.productField === 'custom_ignore') return;

                    if (map.productField === 'custom_price_current') {
                        // FIX: User requests "3,999.00" format (Comma=Thousand, Dot=Decimal)
                        // Remove commas, keep dots.
                        const cleanPrice = parseFloat(value.replace(/,/g, '').replace(/[^\d.-]/g, ''));
                        newProduct.price.current = isNaN(cleanPrice) ? 0 : cleanPrice;
                    } else if (map.productField === 'custom_price_original') {
                        const cleanPrice = parseFloat(value.replace(/,/g, '').replace(/[^\d.-]/g, ''));
                        newProduct.price.original = isNaN(cleanPrice) ? 0 : cleanPrice;
                    } else if (map.productField === 'custom_images') {
                        const urls = value.split(',').map(url => url.trim()).filter(url => url.length > 0);
                        newProduct.images.push(...urls);
                    } else if (map.productField === 'stock') {
                        newProduct.stock = parseInt(value) || 0;
                    } else if (map.productField === 'specs_color') {
                        newProduct.specs.color = value;
                    } else if (map.productField === 'specs_size') {
                        newProduct.specs.size = value;
                    } else if (map.productField === 'specs_shippingType') {
                        newProduct.specs.shippingType = value;
                    } else if (map.productField === 'brand') {
                        newProduct.brand = value;
                    } else if (map.productField === 'custom_category') {
                        const categoryName = value.trim();
                        if (categoryName) {
                            const existingCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
                            if (existingCategory) {
                                newProduct.categories.push(existingCategory.name);
                            } else {
                                newProduct.categories.push(categoryName);
                            }
                        }
                    } else {
                        newProduct[map.productField] = value;
                    }
                });

                newProduct.categories = Array.from(new Set(newProduct.categories));
                if (newProduct.categories.length === 0) newProduct.categories.push('Genel');

                if (newProduct.images.length > 0) newProduct.image = newProduct.images[0];
                else newProduct.image = 'https://via.placeholder.com/300';

                const exists = products.some(p => p.code && p.code === newProduct.code);
                if (!exists && newProduct.name) {
                    mappedProducts.push(newProduct as Product);
                    successCount++;
                } else {
                    failedCount++;
                }
            }

            if (mappedProducts.length > 0) {
                await addBulkProducts(mappedProducts);
            }

            setImportResult({ success: successCount, failed: failedCount });
            setImporting(false);
            setStep(3);
        } catch (error) {
            console.error('Import process failed:', error);
            setImporting(false);
            alert('İçe aktarma sırasında bir hata oluştu: ' + (error as Error).message);
        }
    };

    const reset = () => {
        setFile(null);
        setParsedData([]);
        setStep(1);
        setImportResult(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Toplu Ürün Yükleme (CSV)
            </h2>

            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-8 text-sm">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                    Dosya Yükle
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-100' : 'bg-gray-100'}`}>2</span>
                    Alan Eşleştirme
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-indigo-100' : 'bg-gray-100'}`}>3</span>
                    Sonuç
                </div>
            </div>

            {/* STEP 1: Upload */}
            {step === 1 && (
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".csv"
                        id="csvUpload"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">CSV Dosyasını Buraya Sürükleyin veya Seçin</h3>
                        <p className="text-gray-500 text-sm mb-4">Maksimum dosya boyutu: 10MB</p>
                        <span className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors">
                            Dosya Seç
                        </span>
                    </label>
                    <div className="mt-8 text-left max-w-md mx-auto bg-blue-50 p-4 rounded text-sm text-blue-800">
                        <p className="font-semibold mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> İpucu:</p>
                        <p>Dosyanızın ilk satırı başlık (header) içermelidir (Örn: Ürün Adı, Fiyat, Stok).</p>
                    </div>
                </div>
            )}

            {/* STEP 2: Mapping */}
            {step === 2 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-600">CSV dosyanızdaki sütunları sistemdeki alanlarla eşleştirin.</p>
                        <p className="text-xs text-gray-500">{parsedData.length} satır bulundu.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6">
                        <div className="grid grid-cols-2 bg-gray-100 p-3 border-b border-gray-200 font-medium text-sm text-gray-700">
                            <div>CSV Sütunu (Dosyadaki)</div>
                            <div>Sistem Alanı (Hedef)</div>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                            {mapping.map((map, index) => (
                                <div key={index} className="grid grid-cols-2 p-3 items-center hover:bg-white transition-colors">
                                    <div className="text-sm font-medium text-gray-800 break-words pr-4">
                                        {map.csvHeader}
                                        <div className="text-xs text-gray-400 font-normal mt-1 truncate">
                                            Örn: {parsedData[0]?.[map.csvHeader]?.substring(0, 30)}...
                                        </div>
                                    </div>
                                    <div>
                                        <select
                                            className="w-full border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            value={map.productField}
                                            onChange={(e) => updateMapping(index, e.target.value)}
                                        >
                                            {PRODUCT_FIELDS.map(f => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={reset}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        >
                            İptal
                        </button>
                        <button
                            onClick={processImport}
                            disabled={importing}
                            className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            {importing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    İçe Aktarmayı Başlat
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: Result */}
            {step === 3 && importResult && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">İçe Aktarma Tamamlandı!</h3>
                    <p className="text-gray-600 mb-8">
                        <span className="text-green-600 font-bold">{importResult.success}</span> ürün başarıyla eklendi.<br />
                        <span className="text-red-500 font-bold">{importResult.failed}</span> ürün atlandı (tekrarlanan veya geçersiz).
                    </p>
                    <button
                        onClick={reset}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Yeni Dosya Yükle
                    </button>
                </div>
            )}
        </div>
    );
};
