import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../contexts/SocketContext";
import API from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import compressImage from "../../utils/compressImage";

export default function ProjectDiscussion({ projectId }) {

  const socket = useSocket();
  const { profile } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [replyTo, setReplyTo] = useState(null);

  const [previewMedia, setPreviewMedia] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const messagesEndRef = useRef(null);

  const room = `project:${projectId}`;

  /* ================= LOAD OLD MESSAGES ================= */

  useEffect(() => {

    async function loadMessages() {

      try {

        const res = await API.get(`/messages/${room}`);

        setMessages(res.data || []);

      } catch (err) {

        console.error("Failed to load messages");

      }

    }

    loadMessages();

  }, [projectId]);

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!socket) return;

    socket.emit("join-room", room);

    const onNewMessage = (msg) => {

      if (msg.room === room) {

        setMessages(prev => [...prev, msg]);

      }

    };

    socket.on("message:new", onNewMessage);

    return () => {

      socket.emit("leave-room", room);

      socket.off("message:new", onNewMessage);

    };

  }, [socket, room]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  /* ================= SEND TEXT ================= */

  function sendText() {

    if (!text.trim()) return;

    socket.emit("message", {

      room,

      text,

      meta: {
        type: "text",

        reply: replyTo
          ? {
              messageId: replyTo._id,
              text: replyTo.text,
              senderName: replyTo.senderName
            }
          : null
      }

    });

    setText("");
    setReplyTo(null);

  }

  /* ================= MEDIA UPLOAD ================= */

  async function uploadMedia(e) {

    const file = e.target.files[0];

    if (!file) return;

    try {

      setUploadProgress(1);

      let uploadFile = file;

      // compress images only
      if (file.type.startsWith("image")) {

        uploadFile = await compressImage(file, 0.7, 1280);

      }

      const formData = new FormData();

      formData.append("file", uploadFile, file.name);

      const res = await API.post(
        "/projects/discussion/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },

          onUploadProgress: (progressEvent) => {

            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

            setUploadProgress(percent);

          }
        }
      );

      const url = res.data.url;

      socket.emit("message", {

        room,

        text: url,

        meta: {

          type: file.type.startsWith("video")
            ? "video"
            : "image",

          reply: replyTo
            ? {
                messageId: replyTo._id,
                text: replyTo.text,
                senderName: replyTo.senderName
              }
            : null

        }

      });

      setReplyTo(null);

      setUploadProgress(0);

    } catch (err) {

      console.error("Upload failed", err);

      setUploadProgress(0);

    }

  }

  /* ================= UI ================= */

  return (

    <div className="space-y-3 relative">

      {/* CHAT AREA */}

      <div className="h-72 overflow-y-auto border rounded p-3 bg-gray-50">

        {messages.map(m => (

          <div
            key={m._id}
            className={`mb-3 p-2 rounded max-w-[70%] cursor-pointer ${
              m.from?._id === profile?._id
                ? "bg-indigo-100 ml-auto"
                : "bg-white"
            }`}
          >

            {/* NAME */}

            <div className="text-xs text-gray-600 mb-1">

              <strong>{m.from?.name}</strong>

              <span className="ml-2 px-2 py-0.5 rounded bg-gray-200">
                {m.from?.role}
              </span>

            </div>

            {/* REPLY PREVIEW */}

            {m.meta?.reply && (

              <div className="bg-gray-200 p-1 rounded text-xs mb-1">

                Reply to: {m.meta.reply.senderName}

                <div className="truncate">
                  {m.meta.reply.text}
                </div>

              </div>

            )}

            {/* TEXT */}

            {m.meta?.type === "text" && (

              <p
                onClick={() =>
                  setReplyTo({
                    _id: m._id,
                    text: m.text,
                    senderName: m.from?.name
                  })
                }
              >
                {m.text}
              </p>

            )}

            {/* IMAGE */}

            {m.meta?.type === "image" && (

              <img
                src={m.text}
                loading="lazy"
                className="w-40 rounded mt-1 hover:scale-105 transition"
                onClick={() =>
                  setPreviewMedia({
                    url: m.text,
                    type: "image"
                  })
                }
              />

            )}

            {/* VIDEO */}

            {m.meta?.type === "video" && (

              <video
                className="w-40 rounded mt-1"
                controls
                onClick={() =>
                  setPreviewMedia({
                    url: m.text,
                    type: "video"
                  })
                }
              >
                <source src={m.text} />
              </video>

            )}

          </div>

        ))}

        <div ref={messagesEndRef} />

      </div>

      {/* UPLOAD PROGRESS */}

      {uploadProgress > 0 && (

        <div className="text-xs text-indigo-600">

          Uploading {uploadProgress}%

        </div>

      )}

      {/* REPLY BAR */}

      {replyTo && (

        <div className="bg-gray-200 p-2 flex justify-between text-xs">

          Replying to {replyTo.senderName}

          <button onClick={() => setReplyTo(null)}>
            ✕
          </button>

        </div>

      )}

      {/* INPUT */}

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message"
        className="border p-2 w-full rounded"
        onKeyDown={e =>
          e.key === "Enter" && sendText()
        }
      />

      <div className="flex gap-2">

        <button
          onClick={sendText}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={uploadMedia}
        />

      </div>

      {/* FULL PREVIEW MODAL */}

      {previewMedia && (

        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setPreviewMedia(null)}
        >

          {previewMedia.type === "image" ? (

            <img
              src={previewMedia.url}
              className="max-h-[90vh]"
            />

          ) : (

            <video
              src={previewMedia.url}
              controls
              className="max-h-[90vh]"
            />

          )}

        </div>

      )}

    </div>

  );

}
