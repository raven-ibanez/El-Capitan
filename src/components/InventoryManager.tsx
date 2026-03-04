import React, { useState, useEffect } from 'react';
import { Package, ArrowUpRight, ArrowDownRight, RefreshCcw, Search, Filter } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { supabase } from '../lib/supabase';
import { InventoryLog } from '../types';

const InventoryManager: React.FC = () => {
    const { menuItems, loading, updateStock, refetch } = useMenu();
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'stock-low' | 'stock-high' | 'category'>('name');
    const [adjustingId, setAdjustingId] = useState<{ menuItemId: string; variationId: string | null } | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState('0');
    const [adjustmentReason, setAdjustmentReason] = useState('Restock');

    const fetchLogs = async () => {
        try {
            setLogsLoading(true);
            const { data, error } = await supabase
                .from('inventory_logs')
                .select(`
          *,
          menu_items (name)
        `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            setLogs(data?.map((log: any) => ({
                ...log,
                menu_item_name: log.menu_items?.name
            })) || []);
        } catch (err) {
            console.error('Error fetching inventory logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleAdjustStock = async () => {
        if (!adjustingId) return;

        try {
            const amount = parseInt(adjustmentAmount);
            if (isNaN(amount) || amount === 0) return;

            await updateStock(adjustingId.menuItemId, adjustingId.variationId, amount, adjustmentReason);
            setAdjustingId(null);
            setAdjustmentAmount('0');
            setAdjustmentReason('Restock');
            fetchLogs();
        } catch (err) {
            console.error('Error adjusting stock:', err);
            alert('Failed to adjust stock. Please try again.');
        }
    };

    const getMinStock = (item: any) => {
        if (item.trackInventory) return item.stockQuantity ?? 0;
        if (item.variations?.length) {
            const trackableVars = item.variations.filter((v: any) => v.trackInventory);
            if (trackableVars.length === 0) return Infinity;
            return Math.min(...trackableVars.map((v: any) => v.stockQuantity ?? 0));
        }
        return Infinity;
    };

    const filteredItems = menuItems
        .filter((item: any) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Check main item or any variation
            const isOutOfStock = (item.trackInventory && (item.stockQuantity ?? 0) === 0) ||
                (item.variations?.some((v: any) => v.trackInventory && (v.stockQuantity ?? 0) === 0));

            const isLowStock = (item.trackInventory && (item.stockQuantity ?? 0) !== 0 && (item.stockQuantity ?? 0) <= (item.lowStockThreshold || 0)) ||
                (item.variations?.some((v: any) => v.trackInventory && (v.stockQuantity ?? 0) !== 0 && (v.stockQuantity ?? 0) <= (v.lowStockThreshold || 0)));

            if (filter === 'out-of-stock') return matchesSearch && isOutOfStock;
            if (filter === 'low-stock') return matchesSearch && isLowStock;
            return matchesSearch;
        })
        .sort((a: any, b: any) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'category') return a.category.localeCompare(b.category);
            if (sortBy === 'stock-low') return getMinStock(a) - getMinStock(b);
            if (sortBy === 'stock-high') return getMinStock(b) - getMinStock(a);
            return 0;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCcw className="h-8 w-8 text-captain-cyan animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-captain-white flex items-center gap-2">
                    <Package className="h-6 w-6 text-captain-cyan" />
                    Inventory Management
                </h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-captain-light/50" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-white text-sm focus:outline-none focus:border-captain-cyan/50 w-full sm:w-64"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-captain-light/50" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="pl-10 pr-8 py-2 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-white text-sm focus:outline-none focus:border-captain-cyan/50 appearance-none cursor-pointer"
                        >
                            <option value="all">Status: All</option>
                            <option value="low-stock">Status: Low Stock</option>
                            <option value="out-of-stock">Status: Out of Stock</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-captain-light/50" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="pl-10 pr-8 py-2 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-white text-sm focus:outline-none focus:border-captain-cyan/50 appearance-none cursor-pointer"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="stock-low">Sort: Stock (Low to High)</option>
                            <option value="stock-high">Sort: Stock (High to Low)</option>
                            <option value="category">Sort: Category</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { refetch(); fetchLogs(); }}
                        className="p-2 bg-captain-blue border border-captain-cyan/20 rounded-lg text-captain-cyan hover:bg-captain-cyan/10 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCcw className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Inventory List */}
                <div className="xl:col-span-2 space-y-4">
                    {filteredItems.map((item: any) => (
                        <div key={item.id} className="bg-captain-blue/30 border border-captain-cyan/10 rounded-xl overflow-hidden shadow-lg p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-captain-cyan/20" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-captain-navy flex items-center justify-center text-2xl border border-captain-cyan/20">
                                            {item.category?.includes('water') ? '💧' : '🧊'}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-captain-white text-lg">{item.name}</h3>
                                        <p className="text-xs text-captain-cyan/80 font-bold uppercase tracking-wider">{item.category.replace('-', ' ')}</p>
                                    </div>
                                </div>

                                {!item.variations?.length && (
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${!item.trackInventory ? 'bg-gray-500/20 text-gray-400' :
                                                (item.stockQuantity ?? 0) === 0 ? 'bg-red-500/20 text-red-500' :
                                                    (item.stockQuantity ?? 0) <= (item.lowStockThreshold || 0) ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-green-500/20 text-green-500'
                                                }`}>
                                                {!item.trackInventory ? 'Tracking Off' : (item.stockQuantity ?? 0) === 0 ? 'Out of Stock' : (item.stockQuantity ?? 0) <= (item.lowStockThreshold || 0) ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </div>
                                        {item.trackInventory && (
                                            <div className="text-2xl font-bold text-captain-white mt-1">
                                                {item.stockQuantity ?? 0}
                                                <button
                                                    onClick={() => setAdjustingId({ menuItemId: item.id, variationId: null })}
                                                    className="ml-2 p-1 text-captain-cyan hover:bg-captain-cyan/10 rounded transition-colors"
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {item.variations && item.variations.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                    {item.variations.map((v: any) => (
                                        <div key={v.id} className="bg-captain-navy/40 p-3 rounded-lg border border-captain-cyan/5 flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-bold text-captain-white">{v.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${!v.trackInventory ? 'bg-gray-400 text-captain-navy' :
                                                        (v.stockQuantity ?? 0) === 0 ? 'bg-red-500/20 text-red-500' :
                                                            (v.stockQuantity ?? 0) <= (v.lowStockThreshold || 0) ? 'bg-yellow-500/20 text-yellow-500' :
                                                                'bg-green-500/20 text-green-500'
                                                        }`}>
                                                        {!v.trackInventory ? 'Off' : (v.stockQuantity ?? 0) === 0 ? 'Out' : (v.stockQuantity ?? 0) <= (v.lowStockThreshold || 0) ? 'Low' : 'OK'}
                                                    </span>
                                                </div>
                                            </div>

                                            {v.trackInventory && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-captain-white">{v.stockQuantity ?? 0}</span>
                                                    <button
                                                        onClick={() => setAdjustingId({ menuItemId: item.id, variationId: v.id })}
                                                        className="p-1 text-captain-cyan hover:bg-captain-cyan/10 rounded transition-colors"
                                                    >
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="bg-captain-blue/20 border border-captain-cyan/10 rounded-xl p-12 text-center">
                            <Package className="h-12 w-12 text-captain-cyan/30 mx-auto mb-4" />
                            <p className="text-captain-white font-medium">No items found matching your filters.</p>
                        </div>
                    )}
                </div>

                {/* History Sidebar */}
                <div className="space-y-6">
                    <div className="bg-captain-blue/30 border border-captain-cyan/10 rounded-xl shadow-lg p-5">
                        <h3 className="font-semibold text-captain-white mb-4 flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 text-captain-cyan" />
                            Recent Activity
                        </h3>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {logsLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse flex gap-3">
                                        <div className="w-8 h-8 rounded bg-captain-navy/50" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-captain-navy/50 rounded w-1/2" />
                                            <div className="h-2 bg-captain-navy/50 rounded w-full" />
                                        </div>
                                    </div>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log: any) => (
                                    <div key={log.id} className="flex gap-3 items-start border-b border-captain-cyan/5 pb-3 last:border-0">
                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${log.change_amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {log.change_amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-captain-white truncate">
                                                {log.menu_item_name} {log.variation_id ? '(Variation)' : ''}
                                            </p>
                                            <p className="text-[10px] text-captain-cyan font-bold mt-0.5">
                                                <span className={log.change_amount > 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                                    {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                                                </span>
                                                {' • '}{log.reason}
                                            </p>
                                            <p className="text-[9px] text-captain-light font-bold font-mono mt-0.5 bg-captain-navy px-1 py-0.5 inline-block rounded">
                                                {new Date(log.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-center text-captain-light/40 py-8 italic">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            {adjustingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-captain-blue border border-captain-cyan/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-scale-in">
                        <h3 className="text-xl font-bold text-captain-white mb-2">Adjust Stock</h3>
                        <p className="text-sm text-captain-light/70 mb-6">
                            Adjusting stock for: <span className="text-captain-cyan font-semibold">
                                {menuItems.find((i: any) => i.id === adjustingId.menuItemId)?.name}
                                {adjustingId.variationId ? ` (${menuItems.find((i: any) => i.id === adjustingId.menuItemId)?.variations?.find((v: any) => v.id === adjustingId.variationId)?.name})` : ''}
                            </span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-captain-light/50 uppercase tracking-tighter mb-1.5">Adjustment Amount</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setAdjustmentAmount((prev: any) => (parseInt(prev) - 1).toString())}
                                        className="w-10 h-10 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-cyan hover:bg-captain-cyan/10 transition-colors flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={adjustmentAmount}
                                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-white text-center focus:outline-none focus:border-captain-cyan/50"
                                    />
                                    <button
                                        onClick={() => setAdjustmentAmount((prev: any) => (parseInt(prev) + 1).toString())}
                                        className="w-10 h-10 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-cyan hover:bg-captain-cyan/10 transition-colors flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-[10px] text-captain-light/40 mt-1 italic">Use negative numbers to deduct stock (e.g., -5)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-captain-light/50 uppercase tracking-tighter mb-1.5">Reason</label>
                                <select
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    className="w-full px-4 py-2 bg-captain-navy border border-captain-cyan/20 rounded-lg text-captain-white text-sm focus:outline-none focus:border-captain-cyan/50 appearance-none"
                                >
                                    <option value="Restock">📦 Restock / New Entry</option>
                                    <option value="Manual Adjustment">⚙️ Manual Adjustment</option>
                                    <option value="Inventory Count">📊 Inventory Count</option>
                                    <option value="Damage/Loss">⚠️ Damage / Loss</option>
                                    <option value="Sale">💰 Sale / Deduction</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setAdjustingId(null)}
                                    className="flex-1 py-2 bg-transparent border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdjustStock}
                                    className="flex-1 py-2 bg-captain-cyan text-captain-navy rounded-lg hover:bg-cyan-300 transition-all font-bold text-sm"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
