export function Input({ label, error, ...props }) {
  return (
    <div className="mb-8 text-gray-700">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}