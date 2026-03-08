import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Pin, X, Edit } from "lucide-react";
import API from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CreateNoticeModal from "../components/modals/CreateNoticeModal";
import EditNoticeModal from "../components/modals/EditNoticeModal";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

export default function Notices() {

  const { profile } = useAuth();
  const socket = useSocket();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);


  // ===============================
  // LOAD NOTICES
  // ===============================

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {

    try {

      const res = await API.get("/notices");

      setNotices(res.data || []);

    }
    catch (err) {

      console.error("Fetch notices failed:", err);

    }
    finally {

      setLoading(false);

    }

  }


  // ===============================
  // SAFE ADD NOTICE
  // ===============================

  function addNoticeSafe(notice) {

    setNotices(prev => {

      const exists = prev.some(n => n._id === notice._id);

      if (exists) return prev;

      return [notice, ...prev];

    });

  }


  // ===============================
  // SOCKET REALTIME
  // ===============================

  useEffect(() => {

    if (!socket) return;

    socket.on("notice:new", addNoticeSafe);

    socket.on("notice:update", updated => {

      setNotices(prev =>
        prev.map(n =>
          n._id === updated._id ? updated : n
        )
      );

    });

    socket.on("notice:delete", id => {

      setNotices(prev =>
        prev.filter(n => n._id !== id)
      );

    });

    return () => {

      socket.off("notice:new");
      socket.off("notice:update");
      socket.off("notice:delete");

    };

  }, [socket]);


  // ===============================
  // DELETE NOTICE
  // ===============================

  async function deleteNotice(id) {

    if (!window.confirm("Delete this notice?")) return;

    try {

      await API.delete(`/notices/${id}`);

      setNotices(prev =>
        prev.filter(n => n._id !== id)
      );

    }
    catch {

      alert("Delete failed");

    }

  }


  // ===============================
  // PIN NOTICE
  // ===============================

  async function togglePin(id) {

    try {

      const res = await API.put(`/notices/${id}/pin`);

      setNotices(prev =>
        prev.map(n =>
          n._id === id ? res.data : n
        )
      );

    }
    catch {

      alert("Pin failed");

    }

  }


  // ===============================
  // UPDATE NOTICE (FROM EDIT MODAL)
  // ===============================

  function updateNotice(updated) {

    setNotices(prev =>
      prev.map(n =>
        n._id === updated._id ? updated : n
      )
    );

  }


  // ===============================
  // ROLE CHECK
  // ===============================

  const canCreate =
    ["faculty", "clubhead", "admin"]
      .includes(profile?.role?.toLowerCase());


  // ===============================
  // LOADING STATE
  // ===============================

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Notices...
      </div>
    );


  return (

    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fb] via-[#f2f2f7] to-[#e7e9ff] p-8">


      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold flex items-center gap-2">

          <Bell className="w-6 h-6 text-indigo-500" />

          Notice Board

        </h1>

        {canCreate && (

          <Button
            onClick={() => setOpenModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={18} />
            Create Notice
          </Button>

        )}

      </div>


      {/* LIST */}

      {notices.length === 0 ? (

        <p className="text-gray-500">
          No notices yet.
        </p>

      ) : (

        <div className="grid gap-4">

          {notices.map((n) => {

            const isOwner =
              profile?._id === n.author?._id;

            const canManage =
              isOwner || profile?.role === "admin";


            const imageList = [
              ...(n.image ? [n.image] : []),
              ...(Array.isArray(n.images) ? n.images : [])
            ];


            return (

              <Card
                key={n._id}
                className={`p-5 transition ${
                  n.pinned
                    ? "border-2 border-indigo-500"
                    : ""
                }`}
              >


                {/* CATEGORY + DATE */}

                <div className="flex justify-between items-center mb-2">

                  <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded capitalize">
                    {n.category || "general"}
                  </span>

                  <div className="flex items-center gap-2">

                    {n.pinned && (
                      <Pin size={16} className="text-indigo-500" />
                    )}

                    <span className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>

                  </div>

                </div>


                {/* TITLE */}

                <h2 className="text-lg font-semibold">
                  {n.title}
                </h2>


                {/* BODY */}

                <p className="text-gray-700 mt-1">
                  {n.body}
                </p>


                {/* IMAGES */}

                {imageList.length > 0 && (

                  <div className="flex gap-2 mt-3 flex-wrap">

                    {imageList.map((img, i) => (

                      <img
                        key={i}
                        src={img}
                        alt="notice"
                        loading="lazy"
                        onClick={() => setPreviewImage(img)}
                        className="w-32 rounded cursor-pointer hover:scale-105 transition"
                      />

                    ))}

                  </div>

                )}


                {/* AUTHOR */}

                <p className="text-sm text-gray-500 mt-3">

                  Posted by{" "}

                  <strong>
                    {n.author?.name || "Unknown"}
                  </strong>

                  {" • "}

                  {n.author?.role || "Unknown"}

                </p>


                {/* ACTIONS */}

                {canManage && (

                  <div className="flex gap-4 mt-3">

                    <button
                      onClick={() => togglePin(n._id)}
                      className="text-indigo-600 text-sm flex items-center gap-1"
                    >
                      <Pin size={16} />
                      {n.pinned ? "Unpin" : "Pin"}
                    </button>


                    <button
                      onClick={() => setEditingNotice(n)}
                      className="text-blue-600 text-sm flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </button>


                    <button
                      onClick={() => deleteNotice(n._id)}
                      className="text-red-500 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                )}

              </Card>

            );

          })}

        </div>

      )}


      {/* CREATE MODAL */}

      {canCreate && (

        <CreateNoticeModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={addNoticeSafe}
        />

      )}


      {/* EDIT MODAL */}

      {editingNotice && (

        <EditNoticeModal
          notice={editingNotice}
          open={true}
          onClose={() => setEditingNotice(null)}
          onUpdated={updateNotice}
        />

      )}


      {/* FULLSCREEN IMAGE PREVIEW */}

      {previewImage && (

<div
  className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
  onClick={() => setPreviewImage(null)}
>

  <div
    className="relative bg-white p-3 rounded-lg shadow-xl"
    onClick={(e) => e.stopPropagation()}
  >

    {/* Close button */}

    <button
      onClick={() => setPreviewImage(null)}
      className="absolute -top-3 -right-3 bg-white border rounded-full p-1 shadow hover:bg-gray-100"
    >
      <X size={18} />
    </button>


    {/* Image */}

    <img
      src={previewImage}
      alt="preview"
      className="
        max-h-[60vh]
        max-w-[60vw]
        rounded-md
        object-contain
      "
    />

  </div>

</div>

)}


    </div>

  );

}
