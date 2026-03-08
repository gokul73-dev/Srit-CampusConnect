import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../contexts/SocketContext";
import API from "../../services/api";
import compressImage from "../../utils/compressImage";

export default function ClubChat({ clubId, currentUser, clubDetails }) {

  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const messagesEndRef = useRef(null);

  const room = `club:${clubId}`;

  /* ================= ROLE DETECTION ================= */

  function getRole(msg) {

    const senderId = msg.from?._id?.toString();

    const clubHeadId =
      typeof clubDetails?.clubHead === "object"
        ? clubDetails?.clubHead?._id?.toString()
        : clubDetails?.clubHead?.toString();

    const facultyId =
      typeof clubDetails?.faculty === "object"
        ? clubDetails?.faculty?._id?.toString()
        : clubDetails?.faculty?.toString();

    const memberIds = clubDetails?.members?.map(m =>
      typeof m === "object"
        ? m._id?.toString()
        : m?.toString()
    );

    if (senderId === clubHeadId) return "Club Head";
    if (senderId === facultyId) return "Staff-Incharge";
    if (memberIds?.includes(senderId)) return "Member";

    return "";
  }

  /* ================= LOAD MESSAGES ================= */

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

  }, [room]);

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!socket) return;

    socket.emit("join-room", room);

    socket.on("message:new", (msg) => {

      if (msg.room === room) {

        setMessages(prev => [...prev, msg]);

      }

    });

    return () => {

      socket.emit("leave-room", room);

      socket.off("message:new");

    };

  }, [socket, room]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  /* ================= SEND TEXT ================= */

  function sendMessage() {

    if (!text.trim()) return;

    socket.emit("message", {

      room,

      text,

      meta: replyTo
        ? {
            reply: {
              messageId: replyTo._id,
              text: replyTo.text,
              senderName: replyTo.senderName,
            },
          }
        : {},

    });

    setText("");

    setReplyTo(null);

  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(files) {

    try {

      const fileArray = Array.from(files);

      setUploadProgress(1);

      const compressedFiles = [];

      for (let file of fileArray) {

        const compressed = await compressImage(
          file,
          0.7,
          1280
        );

        compressedFiles.push(compressed);

      }

      const formData = new FormData();

      compressedFiles.forEach((file, index) => {

        formData.append(
          "images",
          file,
          `image${index}.jpg`
        );

      });

      const res = await API.post(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {

            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

            setUploadProgress(percent);

          },
        }
      );

      const urls =
        res.data.urls ||
        [res.data.url];

      urls.forEach(url => {

        socket.emit("message", {

          room,

          text: url,

          meta: {},

        });

      });

      setUploadProgress(0);

    } catch (err) {

      console.error("Upload failed:", err);

      setUploadProgress(0);

    }

  }

  /* ================= IMAGE CHECK ================= */

  function isImage(url) {

    if (!url) return false;

    return /\.(jpeg|jpg|png|gif|webp)$/i.test(
      url.split("?")[0]
    );

  }

  /* ================= DRAG DROP ================= */

  function handleDrop(e) {

    e.preventDefault();

    setDragActive(false);

    if (e.dataTransfer.files.length > 0) {

      handleImageUpload(
        e.dataTransfer.files
      );

    }

  }

  /* ================= UI ================= */

  return (

    <div

      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}

      onDragLeave={() =>
        setDragActive(false)
      }

      onDrop={handleDrop}

      className={`flex flex-col h-[400px] border rounded-lg bg-gray-50 relative
      ${dragActive
        ? "border-indigo-500 bg-indigo-50"
        : ""
      }`}
    >

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map(msg => {

          const role = getRole(msg);

          return (

            <div
              key={msg._id}
              className="bg-white p-3 rounded-lg shadow-sm"
            >

              <div className="flex items-center gap-2 mb-1">

                <span className="font-semibold text-sm">
                  {msg.from?.name}
                </span>

                {role && (

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      role === "Club Head"
                        ? "bg-purple-100 text-purple-700"
                        : role === "Staff-Incharge"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {role}
                  </span>

                )}

              </div>

              {msg.meta?.reply && (

                <div className="bg-gray-100 border-l-4 border-indigo-500 p-2 mb-2 text-xs rounded">

                  <strong>
                    {msg.meta.reply.senderName}
                  </strong>

                  <div>
                    {msg.meta.reply.text}
                  </div>

                </div>

              )}

              {isImage(msg.text) ? (

                <img

                  src={msg.text}

                  loading="lazy"

                  decoding="async"

                  alt="chat"

                  onClick={() =>
                    setPreviewImage(msg.text)
                  }

                  className="max-w-[220px] rounded-lg cursor-pointer hover:scale-105 transition"

                />

              ) : (

                <p
                  className="text-sm cursor-pointer"
                  onClick={() =>
                    setReplyTo({
                      _id: msg._id,
                      text: msg.text,
                      senderName: msg.from?.name,
                    })
                  }
                >
                  {msg.text}
                </p>

              )}

            </div>

          );

        })}

        <div ref={messagesEndRef} />

      </div>

      {/* PROGRESS BAR */}

      {uploadProgress > 0 && (

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded">

          Uploading {uploadProgress}%

        </div>

      )}

      {/* REPLY BAR */}

      {replyTo && (

        <div className="bg-gray-200 p-2 text-xs flex justify-between">

          Replying to {replyTo.senderName}

          <button onClick={() =>
            setReplyTo(null)
          }>
            ✕
          </button>

        </div>

      )}

      {/* INPUT */}

      <div className="border-t p-3 flex gap-2 items-center">

        <input

          type="file"

          multiple

          accept="image/*"

          onChange={(e) =>
            handleImageUpload(
              e.target.files
            )
          }

          hidden

          id="imageUpload"

        />

        <label
          htmlFor="imageUpload"
          className="cursor-pointer text-xl"
        >
          📎
        </label>

        <input

          value={text}

          onChange={(e) =>
            setText(e.target.value)
          }

          onKeyDown={(e) =>
            e.key === "Enter" &&
            sendMessage()
          }

          className="flex-1 border rounded px-3 py-2 text-sm"

          placeholder="Type message"

        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          Send
        </button>

      </div>

      {/* IMAGE PREVIEW */}

      {previewImage && (

        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
          onClick={() =>
            setPreviewImage(null)
          }
        >

          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw]"
          />

        </div>

      )}

    </div>

  );

}
