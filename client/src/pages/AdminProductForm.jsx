import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, PLACEHOLDER } from '../api/client.js'
import AdminShell from '../components/AdminShell.jsx'
import Loader from '../components/Loader.jsx'
import { useStore } from '../context/StoreContext.jsx'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/shoe-mart/server'

const blank = {
  brand_id: '', model: '', price: '', old_price: '',
  material: '', closure: '', sole: '', heel_height: '', toe_shape: '',
  gender: 'unisex', insole: '', weight: '', available_sizes: '',
  warranty: '6 months warranty',
  condition_type: 'new', use_case: '', stock: 1,
  is_featured: false, is_fast_moving: false, description: '',
}

export default function AdminProductForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useStore()
  const fileInput = useRef(null)

  const [form, setForm]     = useState(blank)
  const [images, setImages] = useState([])        // relative paths stored in the database
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => { api.brands().then(setBrands).catch(() => {}) }, [])

  useEffect(() => {
    if (!editing) return
    api.product(id)
      .then(({ product }) => {
        setForm({
          brand_id: product.brand_id,
          model: product.model,
          price: product.price,
          old_price: product.old_price ?? '',
          material: product.material ?? '',
          closure: product.closure ?? '',
          sole: product.sole ?? '',
          heel_height: product.heel_height ?? '',
          toe_shape: product.toe_shape ?? '',
          gender: product.gender ?? 'unisex',
          insole: product.insole ?? '',
          weight: product.weight ?? '',
          available_sizes: product.available_sizes ?? '',
          warranty: product.warranty ?? '',
          condition_type: product.condition_type,
          use_case: product.use_case ?? '',
          stock: product.stock,
          is_featured: Number(product.is_featured) === 1,
          is_fast_moving: Number(product.is_fast_moving) === 1,
          description: product.description ?? '',
        })
        // full URLs come back from the API; store them as relative paths again
        setImages((product.images || []).map((u) => u.replace(`${BASE}/`, '').replace(/^.*\/uploads\//, 'uploads/')))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const pickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.uploadImage(file)
      setImages((list) => [...list, res.path])
      toast('Photo uploaded.')
    } catch (err) {
      toast(err.message, 'err')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { ...form, images }
      if (editing) {
        await api.editProduct({ ...payload, id: Number(id) })
        toast('Changes saved.')
      } else {
        await api.addProduct(payload)
        toast('Shoe added to the site.')
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AdminShell title="Edit shoe"><Loader text="Loading this shoe" /></AdminShell>

  return (
    <AdminShell title={editing ? 'Edit shoe' : 'Add a shoe'}>
      {error && <div className="alert alert--error">{error}</div>}

      <form onSubmit={submit} className="admin-form-grid">
        {/* LEFT COLUMN: Media, Basic Info, Detailed Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. PHOTOS PANEL */}
          <div className="panel">
            <h3>Photos</h3>
            <p className="field-note" style={{ margin: '0 0 12px' }}>
              The first photo is the one customers see on the shelf. JPG, PNG or WEBP, up to 5MB.
            </p>

            <div className="image-strip">
              {images.map((path, i) => (
                <figure key={path + i}>
                  <img src={`${BASE}/${path}`} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER }} />
                  <button type="button" onClick={() => setImages(images.filter((_, x) => x !== i))}
                          aria-label="Remove photo">×</button>
                </figure>
              ))}
            </div>

            <input ref={fileInput} type="file" accept="image/*" onChange={pickImage} style={{ display: 'none' }} />
            <button type="button" className="btn btn--ghost btn--small" disabled={uploading}
                    onClick={() => fileInput.current?.click()}>
              {uploading ? 'Uploading' : 'Add a photo'}
            </button>
          </div>

          {/* 2. THE BASICS */}
          <div className="panel">
            <h3>The basics</h3>
            <div className="field-row">
              <label className="field">
                <span>Brand</span>
                <select required value={form.brand_id} onChange={set('brand_id')}>
                  <option value="">Choose a brand</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Model / Style name</span>
                <input required value={form.model} onChange={set('model')} />
              </label>
            </div>

            <label className="field">
              <span>Description shown on the product page</span>
              <textarea value={form.description} onChange={set('description')} />
            </label>
          </div>

          {/* 3. SPECIFICATIONS */}
          <div className="panel">
            <h3>Specifications</h3>
            <div className="field-row">
              <label className="field">
                <span>Upper material</span>
                <input value={form.material} onChange={set('material')} />
              </label>
              <label className="field">
                <span>Closure type</span>
                <input value={form.closure} onChange={set('closure')} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Sole material</span>
                <input value={form.sole} onChange={set('sole')} />
              </label>
              <label className="field">
                <span>Heel height</span>
                <input value={form.heel_height} onChange={set('heel_height')} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Toe shape</span>
                <input value={form.toe_shape} onChange={set('toe_shape')} />
              </label>
              <label className="field">
                <span>Insole</span>
                <input value={form.insole} onChange={set('insole')} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Weight (per shoe)</span>
                <input value={form.weight} onChange={set('weight')} />
              </label>
              <label className="field">
                <span>Warranty</span>
                <input value={form.warranty} onChange={set('warranty')} />
              </label>
            </div>
            <label className="field">
              <span>Available sizes</span>
              <input value={form.available_sizes} onChange={set('available_sizes')} />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Pricing, Stock, Badges, Actions) */}
        <div className="admin-sidebar-sticky">
          {/* PRICING PANEL */}
          <div className="panel">
            <h4 style={{ margin: '0 0 14px' }}>Pricing & Offers</h4>
            <label className="field">
              <span>Selling price (Rs.)</span>
              <input required type="number" min="0" value={form.price} onChange={set('price')} />
            </label>
            <label className="field" style={{ marginBottom: 8 }}>
              <span>Price before offer</span>
              <input type="number" min="0" value={form.old_price} onChange={set('old_price')} />
            </label>
            <p className="field-note" style={{ margin: '0 0 4px', fontSize: '0.78rem' }}>
              Fill this only when on offer. It shows as a crossed-out price and adds the shoe to Offers.
            </p>
          </div>

          {/* INVENTORY & CONDITION */}
          <div className="panel">
            <h4 style={{ margin: '0 0 14px' }}>Inventory</h4>
            <label className="field">
              <span>Pairs in stock</span>
              <input type="number" min="0" value={form.stock} onChange={set('stock')} />
            </label>
            <label className="field" style={{ marginBottom: 0 }}>
              <span>Condition</span>
              <select value={form.condition_type} onChange={set('condition_type')}>
                <option value="new">Brand new</option>
                <option value="used">Pre-owned</option>
              </select>
            </label>
          </div>

          {/* CATEGORY & BADGES */}
          <div className="panel">
            <h4 style={{ margin: '0 0 14px' }}>Classification & Badges</h4>
            <label className="field">
              <span>Category</span>
              <select value={form.use_case} onChange={set('use_case')}>
                <option value="">Not set</option>
                <option value="casual">Casual wear</option>
                <option value="sport">Sports &amp; fitness</option>
                <option value="formal">Formal &amp; office</option>
                <option value="outdoor">Outdoor &amp; hiking</option>
              </select>
            </label>
            <label className="field">
              <span>Gender</span>
              <select value={form.gender} onChange={set('gender')}>
                <option value="men">Men's</option>
                <option value="women">Women's</option>
                <option value="unisex">Unisex</option>
                <option value="kids">Kids'</option>
              </select>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <label className="check" style={{ fontSize: '0.86rem' }}>
                <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} />
                Show in "Picked by the shop"
              </label>
              <label className="check" style={{ fontSize: '0.86rem' }}>
                <input type="checkbox" checked={form.is_fast_moving} onChange={set('is_fast_moving')} />
                Mark as trending
              </label>
            </div>
          </div>

          {/* ACTION BUTTONS CARD (IN LAST) */}
          <div className="panel" style={{ background: '#F8FBFC' }}>
            <h4 style={{ margin: '0 0 14px' }}>{editing ? 'Update Listing' : 'Publish Listing'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn--rose" disabled={saving} style={{ width: '100%', fontWeight: 700 }}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add the shoe'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/products')} style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminShell>
  )
}
