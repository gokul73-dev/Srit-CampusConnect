import { useEffect, useState } from 'react';
import API from '../../services/api';
import { X } from 'lucide-react';

export default function CreateProjectModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      API.get('/projects/students')
        .then(res => setStudents(res.data))
        .catch(() => setStudents([]));
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/projects', {
        title,
        description,
        members: selected
      });

      // ✅ FIX: backend returns project directly
      onCreated(res.data);

      // reset form
      setTitle('');
      setDescription('');
      setSelected([]);

      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Project</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
            required
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border rounded px-3 py-2"
          />

          <select
            multiple
            value={selected}
            onChange={(e) =>
              setSelected([...e.target.selectedOptions].map(o => o.value))
            }
            className="w-full border rounded px-3 py-2"
          >
            {students.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
