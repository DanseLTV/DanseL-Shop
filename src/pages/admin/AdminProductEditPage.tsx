import { useParams } from 'react-router-dom'
import { ProductAdminPanel } from '../../components/admin/ProductAdminPanel'

export function AdminProductEditPage() {
  const { productId } = useParams<{ productId: string }>()

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-hidden p-4">
      <ProductAdminPanel variant="editor" editProductId={productId} />
    </div>
  )
}
