export default function ProjectOverview({ project }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700">
            {project.description || 'No description provided'}
          </p>
        </div>
  
        <div>
          <h3 className="font-semibold mb-2">Team Members</h3>
          <ul className="space-y-1">
            {project.members?.map(m => (
              <li key={m._id} className="text-gray-700">
                {m.name}
              </li>
            ))}
          </ul>
        </div>
  
        <div>
          <h3 className="font-semibold mb-2">Supervisor</h3>
          <p className="text-gray-700">
            {project.faculty?.name || 'Not assigned'}
          </p>
        </div>
  
        <div>
          <h3 className="font-semibold mb-2">Created On</h3>
          <p className="text-gray-700">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }
  