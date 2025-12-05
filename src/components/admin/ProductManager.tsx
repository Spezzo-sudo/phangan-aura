"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { Plus, Edit, Trash, Save, X, Search } from "lucide-react";

type Product = Database['public']['Tables']['products']['Row'];

export function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('products')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingProduct) return;

        const isNew = !editingProduct.id;
        const payload = {
            ...editingProduct,
            updated_at: new Date().toISOString(),
        };

        if (isNew) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any).from('products').insert([payload]);
            if (error) alert('Error creating product: ' + error.message);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('products')
                .update(payload)
                .eq('id', editingProduct.id);
            if (error) alert('Error updating product: ' + error.message);
        }

        setEditingProduct(null);
        setIsCreating(false);
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('products')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            alert('Error deleting product: ' + error.message);
        } else {
            fetchProducts();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Product Inventory</h2>
                <button
                    onClick={() => { setEditingProduct({}); setIsCreating(true); }}
                    className="flex items-center gap-2 bg-aura-teal text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading inventory...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Price</th>
                                <th className="py-3 px-4">Stock</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-gray-900">
                                        {/* Handle JSON name */}
                                        {typeof product.name === 'object' ? (product.name as any)?.en || 'N/A' : product.name}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 capitalize">{product.category}</td>
                                    <td className="py-3 px-4 text-gray-900">{product.price_thb} THB</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${(product.stock_quantity || 0) < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {product.stock_quantity || 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {product.is_active ? (
                                            <span className="text-green-600 text-xs font-bold">Active</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs font-bold">Inactive</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingProduct(product); setIsCreating(false); }}
                                                className="p-1 text-gray-400 hover:text-aura-teal transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal (Simplified) */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{isCreating ? 'New Product' : 'Edit Product'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
                                <input
                                    type="text"
                                    value={typeof editingProduct.name === 'object' ? (editingProduct.name as any)?.en : editingProduct.name || ''}
                                    onChange={e => setEditingProduct({
                                        ...editingProduct,
                                        name: { ...(editingProduct.name as any || {}), en: e.target.value }
                                    })}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (THB)</label>
                                    <input
                                        type="number"
                                        value={editingProduct.price_thb || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, price_thb: Number(e.target.value) })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        value={editingProduct.stock_quantity || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={editingProduct.category || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Body Care">Body Care</option>
                                    <option value="Skincare">Skincare</option>
                                    <option value="Aromatherapy">Aromatherapy</option>
                                    <option value="After Sun">After Sun</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-aura-teal text-white rounded-lg hover:bg-teal-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
