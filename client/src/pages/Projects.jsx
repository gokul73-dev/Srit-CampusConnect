import React, { useEffect, useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import API from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import ProjectDetailsModal from '../components/projects/ProjectDetailsModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { profile } = useAuth();

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await API.get('/projects');
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load projects', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fb] via-[#f2f2f7] to-[#e7e9ff] p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-indigo-500" />
          Projects
        </h1>

        {profile?.role === 'faculty' && (
          <Button
            onClick={() => setOpenCreateModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </Button>
        )}
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet.</p>
      ) : (
        <div className="space-y-4">
          {projects
            .filter(p => p && p._id)
            .map(project => (
              <Card
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className="p-5 cursor-pointer hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold">
                  {project.title || 'Untitled Project'}
                </h2>

                <p className="text-gray-700 mt-1">
                  {project.description || 'No description'}
                </p>

                <div className="text-sm text-gray-600 mt-3">
                  Faculty: {project.faculty?.name || 'Unknown'}
                </div>

                <div className="mt-2">
                  <span className="text-sm font-medium">Team Members:</span>
                  {project.members?.length ? (
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      {project.members.map(m => (
                        <li key={m._id}>{m.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No members yet</p>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-3">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={proj =>
          setProjects(prev => (proj ? [proj, ...prev] : prev))
        }
      />

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
