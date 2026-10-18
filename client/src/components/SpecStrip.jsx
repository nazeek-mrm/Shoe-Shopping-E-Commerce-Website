/**
 * The four details a shoe buyer actually compares.
 * Used on cards, in the cart and on the detail page.
 */
export default function SpecStrip({ product }) {
  const cells = [
    ['Material', product.material],
    ['Closure', product.closure],
    ['Sole', product.sole],
    ['Sizes', product.available_sizes],
  ]
  return (
    <div className="specs">
      {cells.map(([label, value]) => (
        <div key={label}>
          <b>{label}</b>
          {value || '—'}
        </div>
      ))}
    </div>
  )
}
