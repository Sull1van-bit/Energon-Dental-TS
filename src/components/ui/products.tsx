import React, { useEffect, useState } from 'react'
import { supabase } from './../../lib/supabase';

interface Product {
  id: number;
  name_product: string;
  description?: string;
  price?: string;
  image?: string;
}
const Products = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products') // ganti dengan nama tabel kamu
        .select('*')
      if (error) {
        console.error(error)
      } else {
        setProducts((data as Product[]) || [])
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000099]"></div>
      <span className="ml-2 text-[#000099]">Loading...</span>
    </div>
  )

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-[#000099] text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
              Nama Produk
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
              Deskripsi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
              Harga
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
              Foto
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000099]">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {product.name_product}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {product.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#ff6600]">
                {product.price || 'Contact for pricing'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name_product}
                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada produk tersedia.</p>
        </div>
      )}
    </div>
  )
}

export default Products