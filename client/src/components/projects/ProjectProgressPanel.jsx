import { useEffect, useState } from 'react';
import API from '../../services/api';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function ProjectProgressPanel({ projectId }) {
  const { profile } = useAuth();

  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // =========================
  // LOAD PROGRESS HISTORY
  // =========================
  useEffect(() => {
    async function loadProgress() {
      const res = await API.get(`/projects/${projectId}/progress`);
      setHistory(res.data || []);
    }
    loadProgress();
  }, [projectId]);

  // =========================
  // DERIVED VALUES
  // =========================
  const latest = history[0];

  const approved = history.filter(h => h.status === 'approved');
  const avg =
    approved.reduce((sum, p) => sum + p.progressPercent, 0) /
    (approved.length || 1);

  // =========================
  // STUDENT SUBMIT
  // =========================
  async function submitProgress() {
    if (!text) return alert('Please describe your progress');

    const formData = new FormData();
    formData.append('progressPercent', progress);
    formData.append('updateText', text);
    files.forEach(f => formData.append('media', f));

    setLoading(true);

    const res = await API.post(
      `/projects/${projectId}/progress`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    setHistory(prev => [res.data, ...prev]);
    setText('');
    setFiles([]);
    setLoading(false);
  }

  // =========================
  // FACULTY ACTION
  // =========================
  async function updateStatus(id, status) {
    await API.put(`/projects/progress/${id}`, {
      status,
      feedback,
    });

    const res = await API.get(`/projects/${projectId}/progress`);
    setHistory(res.data);
    setFeedback('');
  }

  return (
    <div className="space-y-6">

      {/* ================= STUDENT VIEW ================= */}
      {profile?.role === 'student' && (
        <div className="bg-purple-50 p-5 rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Your Progress Update</h3>
            <span className="text-sm text-gray-600">
              Avg: {Math.round(avg)}%
            </span>
          </div>

          {/* PROGRESS BAR ALWAYS VISIBLE */}
          {latest && (
            <>
              <div className="text-sm mb-1">
                {latest.status === 'approved'
                  ? 'Approved Progress'
                  : latest.status === 'rejected'
                  ? 'Rejected Progress'
                  : 'Pending Approval'}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${
                    latest.status === 'approved'
                      ? 'bg-red-500'
                      : latest.status === 'rejected'
                      ? 'bg-red-400'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${latest.progressPercent}%` }}
                />
              </div>
            </>
          )}

          {/* SLIDER NEVER DISAPPEARS */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={e => setProgress(e.target.value)}
            className="w-full"
          />

          <div className="flex justify-between text-xs">
            <span>0%</span>
            <span>Submitting: {progress}%</span>
            <span>100%</span>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Describe your progress, milestones completed, challenges faced..."
            className="w-full mt-3 p-2 border rounded"
          />

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={e => setFiles([...e.target.files])}
            className="mt-2"
          />

          <Button
            onClick={submitProgress}
            disabled={loading}
            className="w-full mt-4 bg-purple-600 text-white"
          >
            Submit for Approval
          </Button>
        </div>
      )}

      {/* ================= HISTORY (STUDENT + FACULTY) ================= */}
      {history.map(item => (
        <div
          key={item._id}
          className={`p-5 rounded-xl border ${
            item.status === 'approved'
              ? 'bg-green-50 border-green-200'
              : item.status === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex justify-between mb-1">
            <strong>{item.student?.name}</strong>
            <span
              className={`text-xs px-2 py-1 rounded ${
                item.status === 'approved'
                  ? 'bg-green-200 text-green-800'
                  : item.status === 'rejected'
                  ? 'bg-red-200 text-red-800'
                  : 'bg-orange-200 text-orange-800'
              }`}
            >
              {item.status === 'approved'
                ? '✓ Approved'
                : item.status === 'rejected'
                ? 'Rejected'
                : 'Pending'}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                item.status === 'approved'
                  ? 'bg-red-500'
                  : 'bg-purple-500'
              }`}
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>

          <p className="text-sm mt-2">{item.updateText}</p>

          {/* MEDIA PREVIEW */}
          {item.media?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {item.media.map((url, i) =>
                url.includes('video') ? (
                  <video key={i} controls className="w-40 rounded">
                    <source src={url} />
                  </video>
                ) : (
                  <img key={i} src={url} className="w-40 rounded" />
                )
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            Updated: {new Date(item.createdAt).toLocaleString()}
          </div>

          {item.facultyFeedback && (
            <div className="text-xs mt-1 text-gray-600">
              Feedback: {item.facultyFeedback}
            </div>
          )}

          {/* FACULTY CONTROLS */}
          {profile?.role === 'faculty' && item.status === 'pending' && (
            <div className="mt-4 space-y-2">
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Add feedback (optional)"
                className="w-full border p-2 rounded"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => updateStatus(item._id, 'approved')}
                  className="bg-green-600 text-white"
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={() => updateStatus(item._id, 'pending')}
                  className="bg-gray-400 text-white"
                >
                  Revise
                </Button>
                <Button
                  onClick={() => updateStatus(item._id, 'rejected')}
                  className="bg-red-600 text-white"
                >
                  ✕ Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
