import { useState } from "react";
import API from "../../services/api";
import { X, Upload } from "lucide-react";

export default function EditNoticeModal({
  notice,
  open,
  onClose,
  onUpdated
}) {

  const [title, setTitle] = useState(notice?.title || "");
  const [body, setBody] = useState(notice?.body || "");
  const [images, setImages] = useState(
    notice?.images || (notice?.image ? [notice.image] : [])
  );

  const [loading, setLoading] = useState(false);


  async function uploadImages(e) {

    const files = Array.from(e.target.files);

    const formData = new FormData();

    files.forEach(file => formData.append("images", file));

    const res = await API.post("/upload", formData);

    setImages(prev => [...prev, ...res.data.urls]);

  }


  async function updateNotice() {

    setLoading(true);

    try {

      const res = await API.put(`/notices/${notice._id}`, {

        title,
        body,
        images

      });

      onUpdated(res.data);

      onClose();

    }
    catch {

      alert("Update failed");

    }
    finally {

      setLoading(false);

    }

  }


  if (!open) return null;


  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white p-6 rounded w-[500px]">

        <div className="flex justify-between mb-3">

          <h2>Edit Notice</h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>


        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border p-2 mb-3"
        />

        <textarea
          value={body}
          onChange={(e)=>setBody(e.target.value)}
          className="w-full border p-2 mb-3"
        />


        {/* Images */}

        <div className="flex gap-2 flex-wrap mb-3">

          {images.map((img,i)=>(

            <img
              key={i}
              src={img}
              className="w-20 rounded"
            />

          ))}

        </div>


        <label className="cursor-pointer flex gap-2">

          <Upload />

          Replace Images

          <input
            type="file"
            hidden
            multiple
            onChange={uploadImages}
          />

        </label>


        <button
          onClick={updateNotice}
          className="bg-indigo-600 text-white px-4 py-2 mt-4"
        >
          Update
        </button>

      </div>

    </div>

  );

}
