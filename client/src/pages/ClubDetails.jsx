import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ClubChat from '../components/clubs/ClubChat';
import Button from '../components/ui/Button';

export default function ClubDetails() {
  const { id } = useParams();
  const { profile } = useAuth();

  const [club, setClub] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD SINGLE CLUB
  // =========================
  useEffect(() => {
    async function loadClub() {
      try {
        const res = await API.get(`/clubs/${id}`);
        setClub(res.data);
      } catch (err) {
        console.error('Failed to load club');
      } finally {
        setLoading(false);
      }
    }
    loadClub();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!club) return <div className="p-6">Club not found</div>;

  // =========================
  // ROLE CHECKS
  // =========================
  const isHead = club.clubHead?._id === profile?._id;
  const isFaculty = club.faculty?._id === profile?._id;
  const isMember = club.members?.some(
    (m) => m._id === profile?._id
  );

  const canAccessChat = isHead || isFaculty || isMember;

  // =========================
  // APPROVE REQUEST
  // =========================
  async function approve(userId) {
    try {
      await API.post(`/clubs/${id}/approve/${userId}`);
      const res = await API.get(`/clubs/${id}`);
      setClub(res.data);
    } catch (err) {
      console.error('Approval failed');
    }
  }

  // Filter pending requests properly
  const pendingRequests =
    club.joinRequests?.filter(r => r.status === 'pending') || [];

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">{club.name}</h1>

      {/* ================= Tabs ================= */}
      <div className="flex gap-6 mb-6 border-b pb-2">
        {['overview','members','requests','chat'].map(t => (
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
        <div>
          <p>{club.description}</p>
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p><strong>Club Head:</strong> {club.clubHead?.name}</p>
            <p><strong>Faculty:</strong> {club.faculty?.name}</p>
            <p><strong>Total Members:</strong> {club.members?.length}</p>
          </div>
        </div>
      )}

      {/* ================= MEMBERS ================= */}
      {tab === 'members' && (
        <div className="space-y-2">
          {club.members?.map(member => (
            <div
              key={member._id}
              className="border p-2 rounded flex justify-between"
            >
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* ================= REQUESTS (HEAD ONLY) ================= */}
      {tab === 'requests' && isHead && (
        <div className="space-y-2">
          {pendingRequests.length === 0 && (
            <p>No pending requests</p>
          )}

          {pendingRequests.map(req => (
            <div
              key={req.user._id}
              className="flex justify-between border p-2 mb-2 rounded"
            >
              <span>{req.user?.name}</span>
              <Button onClick={() => approve(req.user._id)}>
                Approve
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ================= CHAT (PRIVATE) ================= */}
      {tab === 'chat' && (
        <>
          {canAccessChat ? (
            <ClubChat
              clubId={id}
              currentUser={profile}
            />
          ) : (
            <p className="text-red-500">
              You are not a member of this club.
            </p>
          )}
        </>
      )}

    </div>
  );
}
