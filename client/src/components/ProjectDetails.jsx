import { useEffect, useState } from "react";
import axios from "axios";

const ProjectDetails = ({ project, onClose }) => {
  const [progressList, setProgressList] = useState([]);
  const [updateText, setUpdateText] = useState("");
  const [progressPercent, setProgressPercent] = useState("");

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/projects/${project._id}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProgressList(res.data))
    .catch(err => console.error(err));
  }, []);

  const submitProgress = () => {
    axios.post(
      `http://localhost:5000/api/projects/${project._id}/progress`,
      { updateText, progressPercent },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      alert("Progress submitted");
      onClose();
    });
  };

  const giveFeedback = (progressId, feedback) => {
    axios.post(
      `https://srit-campusconnect-update.onrender.com/api/projects/progress/${progressId}/feedback`,
      { feedback },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      alert("Feedback submitted");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 w-[90%] md:w-[600px] rounded">
        <h2 className="text-xl font-bold mb-2">{project.title}</h2>
        <p className="mb-4">{project.description}</p>

        {role === "student" && (
          <>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Progress %"
              value={progressPercent}
              onChange={e => setProgressPercent(e.target.value)}
            />
            <textarea
              className="border p-2 w-full mb-2"
              placeholder="Progress update"
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
            />
            <button
              onClick={submitProgress}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Submit Progress
            </button>
          </>
        )}

        <hr className="my-4" />

        {progressList.map(p => (
          <div key={p._id} className="border p-2 mb-2">
            <p><b>Student:</b> {p.student.name}</p>
            <p><b>Progress:</b> {p.progressPercent}%</p>
            <p>{p.updateText}</p>

            {role === "faculty" && (
              <button
                onClick={() => {
                  const feedback = prompt("Enter feedback");
                  if (feedback) giveFeedback(p._id, feedback);
                }}
                className="mt-2 bg-purple-600 text-white px-2 py-1 rounded"
              >
                Give Feedback
              </button>
            )}
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-3 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;
