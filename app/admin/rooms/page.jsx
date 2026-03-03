// app/admin/rooms/page.jsx
// COMPLETE REPLACEMENT - fixed + dark themed

'use client'

import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, Users, MapPin,
  CheckCircle2, XCircle, DoorOpen, X, Save,
} from 'lucide-react'

// ─── Amenity Tag ──────────────────────────────────────────────────────────────
function AmenityTag({ label }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
      {label}
    </span>
  )
}

// ─── Room Form Modal ──────────────────────────────────────────────────────────
function RoomModal({ room, onClose, onSaved }) {
  const isEdit = !!room
  const [form, setForm]       = useState({
    name:      room?.name        ?? '',
    capacity:  room?.capacity    ?? '',
    floor:     room?.floor       ?? '',
    amenities: room?.amenities?.join(', ') ?? '',
  })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Room name is required'); return }
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) < 1) {
      setError('Capacity must be a number ≥ 1'); return
    }

    setSaving(true)
    try {
      const payload = {
        name:        form.name.trim(),
        capacity:    Number(form.capacity),
        floor:       form.floor.trim(),
        amenities:   form.amenities.split(',').map(a => a.trim()).filter(Boolean),
        isAvailable: true,
      }

      const url    = isEdit ? `/api/admin/rooms/${room._id}` : '/api/admin/rooms'
      const method = isEdit ? 'PATCH' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || 'Failed to save room'); setSaving(false); return }
      onSaved()
    } catch (err) {
      setError('Something went wrong')
      setSaving(false)
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">
              {isEdit ? 'Edit Room' : 'Add New Room'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Room Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Room Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Meeting Room 1"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Capacity + Floor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Capacity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
                placeholder="e.g. 8"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Floor</label>
              <input
                type="text"
                value={form.floor}
                onChange={e => setForm({ ...form, floor: e.target.value })}
                placeholder="e.g. Floor 2"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Amenities
              <span className="text-gray-600 font-normal ml-1">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.amenities}
              onChange={e => setForm({ ...form, amenities: e.target.value })}
              placeholder="Projector, Whiteboard, Video Conference"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {/* Live preview */}
            {form.amenities.trim() && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.amenities.split(',').map(a => a.trim()).filter(Boolean).map((a, i) => (
                  <AmenityTag key={i} label={a} />
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ room, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res  = await fetch(`/api/admin/rooms/${room._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to delete'); setDeleting(false); return }
      onDeleted()
    } catch {
      setError('Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Delete Room</p>
            <p className="text-gray-500 text-xs mt-0.5">This cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          Are you sure you want to delete <span className="text-white font-medium">"{room.name}"</span>?
          Rooms with future bookings cannot be deleted.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageRoomsPage() {
  const [rooms, setRooms]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editRoom, setEditRoom]     = useState(null)   // null = add, object = edit
  const [deleteRoom, setDeleteRoom] = useState(null)   // null = hidden

  useEffect(() => { fetchRooms() }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/rooms')
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaved = () => {
    setShowModal(false)
    setEditRoom(null)
    fetchRooms()
  }

  const handleDeleted = () => {
    setDeleteRoom(null)
    fetchRooms()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* ── Modals ── */}
      {(showModal || editRoom) && (
        <RoomModal
          room={editRoom}
          onClose={() => { setShowModal(false); setEditRoom(null) }}
          onSaved={handleSaved}
        />
      )}
      {deleteRoom && (
        <DeleteModal
          room={deleteRoom}
          onClose={() => setDeleteRoom(null)}
          onDeleted={handleDeleted}
        />
      )}

      <div className="space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Rooms</h1>
            <p className="text-gray-400 text-sm mt-1">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={() => { setEditRoom(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{rooms.length}</p>
            <p className="text-gray-500 text-xs mt-1">Total Rooms</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {rooms.reduce((s, r) => s + (r.capacity || 0), 0)}
            </p>
            <p className="text-gray-500 text-xs mt-1">Total Capacity</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-sky-400">
              {rooms.length > 0 ? Math.round(rooms.reduce((s, r) => s + (r.capacity || 0), 0) / rooms.length) : 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">Avg Capacity</p>
          </div>
        </div>

        {/* ── Rooms Grid ── */}
        {rooms.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
            <DoorOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No rooms yet</p>
            <p className="text-gray-600 text-sm mt-1">Click "Add Room" to create your first room</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map(room => (
              <div
                key={room._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DoorOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{room.name}</h3>
                      {room.floor && (
                        <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{room.floor}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — show on hover */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditRoom(room)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-sky-500/20 text-gray-400 hover:text-sky-400 transition-all"
                      title="Edit room"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteRoom(room)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                      title="Delete room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-400 text-sm">
                    Capacity: <span className="text-white font-medium">{room.capacity}</span> people
                  </span>
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.map((a, i) => <AmenityTag key={i} label={a} />)}
                  </div>
                ) : (
                  <p className="text-gray-700 text-xs">No amenities listed</p>
                )}

                {/* Divider + Edit button visible always on mobile */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800 md:hidden">
                  <button
                    onClick={() => setEditRoom(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-800 text-gray-400 text-xs font-medium hover:text-white transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteRoom(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
