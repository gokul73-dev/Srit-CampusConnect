import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import ClubChat from './ClubChat';

export default function ClubDetailsModal({ club, onClose, refresh }) {
  const { profile } = useAuth();
  const [details, setDetails] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (club?._id) {
      loadClub();
    }
  }, [club]);

  async function loadClub() {
    try {
      const res = await API.get(`/clubs/${club._id}`);
      setDetails(res.data);
    } catch (err) {
      console.error('Failed to load club');
    }
  }

  async function approve(userId) {
    await API.put(`/clubs/${club._id}/approve/${userId}`);
    loadClub();
    refresh();
  }

  async function reject(userId) {
    await API.put(`/clubs/${club._id}/reject/${userId}`);
    loadClub();
    refresh();
  }

  if (!details) return null;

  // ===============================
  // SAFE ROLE CHECKS (BULLETPROOF)
  // ===============================

  const userId =
    profile?._id?.toString() ||
    profile?.id?.toString() ||
    null;

  const clubHeadId =
    typeof details.clubHead === "object"
      ? details.clubHead?._id?.toString()
      : details.clubHead?.toString();

  const facultyId =
    typeof details.faculty === "object"
      ? details.faculty?._id?.toString()
      : details.faculty?.toString();

  const memberIds = details.members?.map(m =>
    typeof m === "object"
      ? m._id?.toString()
      : m?.toString()
  );

  const isHead = userId && clubHeadId && userId === clubHeadId;
  const isFaculty = userId && facultyId && userId === facultyId;
  const isMember = userId && memberIds?.includes(userId);

  const canAccessChat = isHead || isFaculty || isMember;

  const pendingRequests = details.joinRequests?.filter(
    r => r.status === 'pending'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] max-h-[85vh] overflow-y-auto rounded-xl p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{details.name}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b pb-2">
          {['overview', 'members', 'chat'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`capitalize pb-2 ${
                tab === t
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ================= OVERVIEW ================= */}
        {tab === 'overview' && (
          <>
            <p className="text-gray-600">{details.description}</p>

            <div className="text-sm space-y-1 mt-3">
              <p><strong>Club Head:</strong> {details.clubHead?.name}</p>
              <p><strong>Faculty:</strong> {details.faculty?.name}</p>
              <p><strong>Total Members:</strong> {details.members?.length}</p>
            </div>

            {(isHead || isFaculty) && pendingRequests?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-orange-600">
                  Pending Join Requests
                </h3>

                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div
                      key={req.user?._id}
                      className="flex justify-between items-center bg-orange-50 p-3 rounded-lg"
                    >
                      <span>{req.user?.name}</span>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => approve(req.user._id)}
                          className="bg-green-600 text-white px-3 py-1 text-sm"
                        >
                          Approve
                        </Button>

                        <Button
                          onClick={() => reject(req.user._id)}
                          className="bg-red-600 text-white px-3 py-1 text-sm"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= MEMBERS ================= */}
        {tab === 'members' && (
          <div>
            <h3 className="font-semibold mb-2">Members</h3>
            <ul className="space-y-1 text-sm">
              {details.members?.map(m => (
                <li key={m._id}>• {m.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ================= PRIVATE CHAT ================= */}
        {tab === 'chat' && (
          <>
            {canAccessChat ? (
              <ClubChat
                clubId={details._id}
                currentUser={profile}
              />
            ) : (
              <p className="text-red-500">
                You are not allowed to access this private club chat.
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
}
