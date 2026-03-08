import { useState } from 'react';
import { X } from 'lucide-react';

import ProjectOverview from './ProjectOverview';
import ProjectProgressPanel from './ProjectProgressPanel';
import ProjectMilestones from './ProjectMilestones';
import ProjectDiscussion from './ProjectDiscussion';

export default function ProjectDetailsModal({ project, onClose }) {
  const [tab, setTab] = useState('overview');

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-6 py-3 border-b text-sm font-medium">
          {['overview', 'progress', 'milestones', 'discussion'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 capitalize ${
                tab === t
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {tab === 'overview' && <ProjectOverview project={project} />}
          {tab === 'progress' && (
            <ProjectProgressPanel projectId={project._id} />
          )}
          {tab === 'milestones' && <ProjectMilestones />}
          {tab === 'discussion' && (
            <ProjectDiscussion projectId={project._id} />
          )}
        </div>

      </div>
    </div>
  );
}
