import React, { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import API from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreateLostFoundModal from '../components/modals/CreateLostFoundModal';
import { useAuth } from '../contexts/AuthContext';

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { profile } = useAuth();

  async function loadItems() {
    try {
      const res = await API.get('/lost-found');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load lost-found items', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Lost & Found...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fb] via-[#f2f2f7] to-[#e7e9ff] p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" />
          Lost & Found
        </h1>

        <Button
          onClick={() => setOpenModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Report Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">No items reported yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((i) => (
            <Card key={i._id} className="p-5 hover:shadow-md transition">
              <h2 className="text-lg font-semibold">{i.title}</h2>

              <p className="text-gray-700 mt-1">
                {i.description || 'No details provided'}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Type: {i.found ? 'Found Item' : 'Lost Item'}
              </p>

              <p className="text-sm text-gray-600">
                Location: {i.location || 'Not specified'}
              </p>

              <span
                className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                  i.approved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {i.approved ? 'Approved' : 'Pending Approval'}
              </span>

              {profile?.role === 'admin' && !i.approved && (
                <div className="mt-3">
                  <Button
                    onClick={async () => {
                      await API.post(`/lost-found/${i._id}/approve`);
                      loadItems();
                    }}
                    className="bg-green-600 text-white"
                  >
                    Approve
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-400 mt-3">
                Posted {new Date(i.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateLostFoundModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={(item) => setItems((prev) => [item, ...prev])}
      />
    </div>
  );
}
