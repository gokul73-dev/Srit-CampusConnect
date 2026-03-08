import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CreateClubModal from '../components/clubs/CreateClubModal';
import ClubDetailsModal from '../components/clubs/ClubDetailsModal';

export default function Clubs() {
  const { profile } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubs();
  }, []);

  async function loadClubs() {
    try {
      setLoading(true);
      const res = await API.get('/clubs');
      setClubs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load clubs', err);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }

  async function joinClub(id) {
    try {
      await API.post(`/clubs/${id}/join`);
      alert('Join request sent successfully');
      loadClubs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading clubs...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clubs</h1>

        {(profile?.role === 'admin' || profile?.role === 'faculty') && (
          <Button
            onClick={() => setOpenCreate(true)}
            className="bg-indigo-600 text-white"
          >
            Create Club
          </Button>
        )}
      </div>

      {/* EMPTY STATE */}
      {clubs.length === 0 && (
        <p className="text-gray-500">No clubs available.</p>
      )}

      {/* CLUB LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {clubs.map(club => {

          const isMember = club.members?.some(
            m => m._id?.toString() === profile?._id?.toString()
          );

          const isPending = club.joinRequests?.some(
            r =>
              r.user?._id?.toString() === profile?._id?.toString() &&
              r.status === 'pending'
          );

          return (
            <Card key={club._id} className="p-5">
              <h2 className="text-lg font-semibold">{club.name}</h2>

              <p className="text-sm text-gray-600 mt-1">
                {club.description}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Head: {club.clubHead?.name || 'Not Assigned'}
              </p>

              <div className="flex gap-2 mt-4 flex-wrap">

                {/* STUDENT JOIN BUTTON */}
                {profile?.role === 'student' && !isMember && !isPending && (
                  <Button
                    onClick={() => joinClub(club._id)}
                    className="bg-green-600 text-white"
                  >
                    Request Join
                  </Button>
                )}

                {/* PENDING BADGE */}
                {profile?.role === 'student' && isPending && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Request Pending
                  </span>
                )}

                {/* MEMBER BADGE */}
                {profile?.role === 'student' && isMember && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Member
                  </span>
                )}

                {/* VIEW DETAILS */}
                
                <Button onClick={() => setSelectedClub(club)}
                   className="bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition"
                  >
                  View
                 </Button>



              </div>
            </Card>
          );
        })}
      </div>

      {/* MODALS */}
      {openCreate && (
        <CreateClubModal
          onClose={() => setOpenCreate(false)}
          onCreated={loadClubs}
        />
      )}

      {selectedClub && (
        <ClubDetailsModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          refresh={loadClubs}
        />
      )}
    </div>
  );
}
