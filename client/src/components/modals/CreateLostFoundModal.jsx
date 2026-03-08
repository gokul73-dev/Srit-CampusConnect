import { useState } from 'react';
import API from '../../services/api';
import { X } from 'lucide-react';

export default function CreateLostFoundModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Lost');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/lost-found', {
        title,
        status,
        location,
        description,
      });
      onCreated(res.data.item);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting item');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Report Lost or Found Item</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <p className="text-gray-500 mb-4">Help others by reporting items</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Item Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Blue Backpack"
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
            >
              <option>Lost</option>
              <option>Found</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where it was lost/found"
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description..."
              className="w-full border rounded-md px-3 py-2 mt-1 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
            >
              {loading ? 'Reporting...' : 'Report Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
