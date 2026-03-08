import { useState, useEffect } from "react";
import API from "../../services/api";
import { X, Upload } from "lucide-react";

export default function CreateNoticeModal({
  open,
  onClose,
  onCreated
}) {

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);

  // animation trigger
  useEffect(() => {
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [open]);


  // ================= IMAGE UPLOAD =================
  async function handleImageUpload(e) {

    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {

      setUploading(true);

      const formData = new FormData();

      files.forEach(file =>
        formData.append("images", file)
      );

      const res = await API.post(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data?.urls) {
        setImages(prev => [...prev, ...res.data.urls]);
      }

    }
    catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    finally {
      setUploading(false);
    }
  }


  // ================= SUBMIT =================
  async function handleSubmit(e) {

    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Title and content required");
      return;
    }

    try {

      setLoading(true);

      const payload = {
        title,
        category,
        body,
        images,
        image: images[0] || null
      };

      const res = await API.post("/notices", payload);

      if (res.data) onCreated(res.data);

      // reset
      setTitle("");
      setCategory("General");
      setBody("");
      setImages([]);

      handleClose();

    }
    catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to create notice"
      );

    }
    finally {
      setLoading(false);
    }
  }


  function handleClose() {

    if (loading || uploading) return;

    setShow(false);

    setTimeout(() => {
      onClose();
    }, 200);
  }


  if (!open) return null;


  return (

    /* BACKDROP */
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center p-4
      transition-all duration-200
      ${show ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}
    `}>

      {/* MODAL */}
      <div className={`
        bg-white w-full max-w-md max-h-[85vh]
        rounded-xl shadow-xl flex flex-col
        transform transition-all duration-200
        ${show
          ? "scale-100 opacity-100"
          : "scale-95 opacity-0"}
      `}>

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">

          <h2 className="text-lg font-semibold">
            Create Notice
          </h2>

          <button onClick={handleClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>

        </div>


        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-3 overflow-y-auto"
        >

          {/* TITLE */}
          <div>

            <label className="text-sm font-medium">
              Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
            />

          </div>


          {/* CATEGORY */}
          <div>

            <label className="text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
            >
              <option>General</option>
              <option>Academic</option>
              <option>Exam</option>
              <option>Event</option>
              <option>Urgent</option>
            </select>

          </div>


          {/* CONTENT */}
          <div>

            <label className="text-sm font-medium">
              Content
            </label>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm h-24"
            />

          </div>


          {/* IMAGE UPLOAD */}
          <div>

            <label className="
              flex items-center gap-2 cursor-pointer
              border p-2 rounded hover:bg-gray-50 text-sm
            ">

              <Upload size={16} />

              {uploading
                ? "Uploading..."
                : "Upload Images"}

              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />

            </label>


            {/* PREVIEW */}
            {images.length > 0 && (

              <div className="flex gap-2 mt-2 flex-wrap">

                {images.map((img, i) => (

                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-14 h-14 rounded object-cover border"
                  />

                ))}

              </div>

            )}

          </div>


          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-3 py-1.5 border rounded text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || uploading}
              className="
                px-3 py-1.5 rounded text-white
                bg-indigo-600 hover:bg-indigo-700 text-sm
              "
            >
              {loading
                ? "Creating..."
                : "Create"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );
}
