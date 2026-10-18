export default function Loader({ text = 'Loading laptops' }) {
  return (
    <div className="loader" role="status">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  )
}
