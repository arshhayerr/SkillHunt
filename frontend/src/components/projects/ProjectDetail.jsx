import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const hasFetched = useRef({});

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [views, setViews] = useState(0);
  const [relatedProjects, setRelatedProjects] = useState([]);

  useEffect(() => {
    if (id && !hasFetched.current[id]) {
      hasFetched.current[id] = true;
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await projectAPI.getProject(id);
      const data = response.data;

      if (data.success && data.project) {
        setProject(data.project);
        setViews(data.project.views || 0);
        
        // Fetch related projects based on tech stack
        if (data.project.techStack && data.project.techStack.length > 0) {
          fetchRelatedProjects(data.project.techStack, data.project._id);
        }
      } else {
        setError(data.message || 'Failed to load project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProjects = async (techStack, currentProjectId) => {
    try {
      const response = await projectAPI.getAllProjects();
      const data = response.data;
        if (data.success && data.projects) {
          const related = data.projects
            .filter(p => p._id !== currentProjectId && p.isPublic)
            .filter(p => {
              if (!p.techStack || !Array.isArray(p.techStack)) return false;
              return p.techStack.some(tech => techStack.includes(tech));
            })
            .slice(0, 3);
          
          setRelatedProjects(related);
      }
    } catch (error) {
      console.error('Error fetching related projects:', error);
    }
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Project link copied to clipboard!');
      } catch (error) {
        console.log('Failed to copy to clipboard:', error);
      }
    }
  };

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl text-gray-600">Invalid project ID</h2>
          <Link
            to="/projects/browse"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Project Not Found</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/projects/browse"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Browse Other Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl text-gray-600">Project not found</h2>
          <Link
            to="/projects/browse"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/projects/browse" className="hover:text-blue-600">Browse Projects</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{project.title}</span>
        </div>
      </nav>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1 mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              
              {/* Author Info */}
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">
                    {project.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">{project.user?.name || 'Unknown Author'}</p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()} • {views} views
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-4">
                {project.isPublic && (
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    Public
                  </span>
                )}
                <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full capitalize">
                  {project.status || 'completed'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                // onClick={handleBookmark}
                // className={`flex items-center px-4 py-2 rounded-lg border transition duration-200 ${
                //   isBookmarked 
                //     ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100' 
                //     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                // }`}
              >
                {/* <svg className="w-4 h-4 mr-2" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg> */}
                {/* {isBookmarked ? 'Bookmarked' : 'Bookmark'} */}
              </button>
              
              {/* <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button> */}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Project</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {project.description || 'No description available.'}
            </p>
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
              <div className="flex flex-wrap gap-3">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View Source Code
              </a>
            )}
            
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Live Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((relatedProject) => (
              <Link
                key={relatedProject._id}
                to={`/projects/${relatedProject._id}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                  {relatedProject.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {relatedProject.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {relatedProject.techStack?.slice(0, 2).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {relatedProject.techStack?.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                      +{relatedProject.techStack.length - 2}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;