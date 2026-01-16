import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Check, AlertTriangle, X, Download, RefreshCw } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

interface CSVRow {
    name: string;
    stock: number;
}

interface MatchResult {
    csvName: string;
    csvStock: number;
    matchedProductId?: string | number;
    matchedProductName?: string;
    currentStock?: number;
    status: 'matched' | 'not_found';
}

export const BulkStockUpdate: React.FC = () => {
    const { products, updateProduct } = useProducts();
    const [dragActive, setDragActive] = useState(false);
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [updateComplete, setUpdateComplete] = useState(false);
    const [updatedCount, setUpdatedCount] = useState(0);

    // Normalize Turkish characters for matching
    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
    };

    // Parse CSV content - supports both simple and Trendyol formats
    const parseCSV = (content: string): CSVRow[] => {
        const lines = content.split('\n').filter(line => line.trim());
        const rows: CSVRow[] = [];

        if (lines.length === 0) return rows;

        // Detect format by checking header
        const header = lines[0].toLowerCase();
        const isTrendyolFormat = header.includes('partner id') || header.includes('ürün adı') && header.includes('ürün stok adedi');

        if (isTrendyolFormat) {
            // Trendyol format: find column indices
            const separator = lines[0].includes(';') ? ';' : ',';
            const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
            const nameIndex = headers.findIndex(h => h.includes('ürün adı'));
            const stockIndex = headers.findIndex(h => h.includes('ürün stok adedi') || h.includes('stok adedi'));

            if (nameIndex === -1 || stockIndex === -1) {
                console.error('Trendyol CSV formatı tanınamadı');
                return rows;
            }

            // Parse data rows
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(separator);
                if (parts.length > Math.max(nameIndex, stockIndex)) {
                    const name = parts[nameIndex].replace(/"/g, '').trim();
                    const stock = parseInt(parts[stockIndex].replace(/"/g, '').trim(), 10);

                    if (name && !isNaN(stock)) {
                        rows.push({ name, stock });
                    }
                }
            }
        } else {
            // Simple format: Ürün Adı,Stok (skip header row)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const separator = line.includes(';') ? ';' : ',';
                const parts = line.split(separator);

                if (parts.length >= 2) {
                    const name = parts[0].replace(/"/g, '').trim();
                    const stock = parseInt(parts[1].replace(/"/g, '').trim(), 10);

                    if (name && !isNaN(stock)) {
                        rows.push({ name, stock });
                    }
                }
            }
        }
        return rows;
    };

    // Match CSV rows with products
    const matchProducts = (csvRows: CSVRow[]): MatchResult[] => {
        return csvRows.map(row => {
            const normalizedCSVName = normalize(row.name);

            // Try exact match first
            let matchedProduct = products.find(p =>
                normalize(p.name) === normalizedCSVName
            );

            // Try partial match if no exact match
            if (!matchedProduct) {
                matchedProduct = products.find(p => {
                    const normalizedProductName = normalize(p.name);
                    return normalizedProductName.includes(normalizedCSVName) ||
                        normalizedCSVName.includes(normalizedProductName);
                });
            }

            if (matchedProduct) {
                return {
                    csvName: row.name,
                    csvStock: row.stock,
                    matchedProductId: matchedProduct.id,
                    matchedProductName: matchedProduct.name,
                    currentStock: matchedProduct.stock,
                    status: 'matched' as const
                };
            }

            return {
                csvName: row.name,
                csvStock: row.stock,
                status: 'not_found' as const
            };
        });
    };

    // Handle file drop/select
    const handleFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const parsed = parseCSV(content);
            const results = matchProducts(parsed);
            setMatchResults(results);
            setUpdateComplete(false);
        };
        reader.readAsText(file, 'UTF-8');
    }, [products]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // Update stocks
    const handleUpdateStocks = async () => {
        setIsProcessing(true);
        let count = 0;

        for (const result of matchResults) {
            if (result.status === 'matched' && result.matchedProductId) {
                await updateProduct(result.matchedProductId, { stock: result.csvStock });
                count++;
            }
        }

        setUpdatedCount(count);
        setUpdateComplete(true);
        setIsProcessing(false);
    };

    // Reset form
    const handleReset = () => {
        setMatchResults([]);
        setUpdateComplete(false);
        setUpdatedCount(0);
    };

    // Download sample CSV
    const downloadSampleCSV = () => {
        const sampleContent = 'Ürün Adı,Stok\nSeramik Kupa,50\nCam Matara 750ml,100\nAhşap Kalemlik,25';
        const blob = new Blob(['\ufeff' + sampleContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ornek_stok_guncelleme.csv';
        link.click();
    };

    const matchedResults = matchResults.filter(r => r.status === 'matched');
    const notFoundResults = matchResults.filter(r => r.status === 'not_found');

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Toplu Stok Güncelle</h1>
                    <p className="text-gray-500 text-sm mt-1">CSV dosyası yükleyerek ürün stoklarınızı toplu güncelleyin</p>
                </div>
                <button
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Örnek CSV İndir
                </button>
            </div>

            {/* Upload Area */}
            {matchResults.length === 0 && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                        }`}
                >
                    <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        CSV Dosyası Yükle
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Dosyayı buraya sürükleyin veya seçin
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                        <Upload className="w-5 h-5" />
                        Dosya Seç
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-gray-400 mt-4">
                        Format: Ürün Adı, Stok (virgül veya noktalı virgül ayraçlı)
                    </p>
                </div>
            )}

            {/* Results */}
            {matchResults.length > 0 && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="text-3xl font-bold text-gray-800">{matchResults.length}</div>
                            <div className="text-sm text-gray-500">Toplam Ürün</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="text-3xl font-bold text-green-600">{matchedResults.length}</div>
                            <div className="text-sm text-green-600">Eşleşen</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <div className="text-3xl font-bold text-orange-600">{notFoundResults.length}</div>
                            <div className="text-sm text-orange-600">Bulunamayan</div>
                        </div>
                    </div>

                    {/* Matched Products Table */}
                    {matchedResults.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-green-800">Eşleşen Ürünler ({matchedResults.length})</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-2 font-medium text-gray-600">CSV'deki Ad</th>
                                            <th className="text-left px-4 py-2 font-medium text-gray-600">Sitedeki Ad</th>
                                            <th className="text-center px-4 py-2 font-medium text-gray-600">Mevcut Stok</th>
                                            <th className="text-center px-4 py-2 font-medium text-gray-600">Yeni Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {matchedResults.map((result, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-gray-700">{result.csvName}</td>
                                                <td className="px-4 py-2 text-gray-900 font-medium">{result.matchedProductName}</td>
                                                <td className="px-4 py-2 text-center text-gray-500">{result.currentStock}</td>
                                                <td className="px-4 py-2 text-center font-bold text-blue-600">{result.csvStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Not Found Products */}
                    {notFoundResults.length > 0 && (
                        <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                <h3 className="font-semibold text-orange-800">
                                    Bu ürünler sitenizde mevcut değil! Eklemeyi unutmayın.
                                </h3>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-2 font-medium text-gray-600">Ürün Adı (CSV)</th>
                                            <th className="text-center px-4 py-2 font-medium text-gray-600">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {notFoundResults.map((result, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50">
                                                <td className="px-4 py-2 text-orange-700">{result.csvName}</td>
                                                <td className="px-4 py-2 text-center text-gray-600">{result.csvStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            İptal
                        </button>

                        {!updateComplete ? (
                            <button
                                onClick={handleUpdateStocks}
                                disabled={isProcessing || matchedResults.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Güncelleniyor...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {matchedResults.length} Ürünü Güncelle
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-lg">
                                <Check className="w-5 h-5" />
                                {updatedCount} ürün başarıyla güncellendi!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
