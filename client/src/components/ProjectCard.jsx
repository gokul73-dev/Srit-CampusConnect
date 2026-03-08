const ProjectCard = ({ project, onOpen }) => {
    return (
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
        <h2 className="text-lg font-semibold">{project.title}</h2>
        <p className="text-sm text-gray-600 mb-2">
          {project.description}
        </p>
  
        <p className="text-sm">
          <b>Faculty:</b> {project.faculty?.name || "N/A"}
        </p>
  
        <button
          onClick={onOpen}
          className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
        >
          View Details
        </button>
      </div>
    );
  };
  
  export default ProjectCard;
  