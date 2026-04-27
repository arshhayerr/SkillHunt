import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const ProjectsBrowse = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [availableTech, setAvailableTech] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectAPI.getAllProjects();
      const data = response.data;

      let projectsArray = [];
      if (data.success && data.projects) {
        projectsArray = data.projects;
      } else if (Array.isArray(data)) {
        projectsArray = data;
      } else if (data.projects && Array.isArray(data.projects)) {
        projectsArray = data.projects;
      }

      setProjects(projectsArray);

      const techSet = new Set();
      projectsArray.forEach(project => {
        const techs = project.techStack || project.technologies || [];
        if (Array.isArray(techs)) {
          techs.forEach(tech => {
            if (tech && typeof tech === 'string') techSet.add(tech.trim());
          });
        }
      });
      setAvailableTech(Array.from(techSet).sort());
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s)
      );
    }
    if (selectedTech) {
      filtered = filtered.filter(p => {
        const t = p.techStack || p.technologies || [];
        return Array.isArray(t) && t.includes(selectedTech);
      });
    }
    setFilteredProjects(filtered);
  };

  const clearFilters = () => { setSearchTerm(''); setSelectedTech(''); };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { filterProjects(); }, [projects, searchTerm, selectedTech]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover innovative projects from talented students
            <span className="ml-2 text-gray-400">&middot;</span>
            <span className="ml-2 text-blue-600 font-medium">{filteredProjects.length} projects</span>
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition lg:w-56"
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
          >
            <option value="">All Technologies</option>
            {availableTech.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedTech) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1.5 text-blue-400 hover:text-blue-600">&times;</button>
              </span>
            )}
            {selectedTech && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                {selectedTech}
                <button onClick={() => setSelectedTech('')} className="ml-1.5 text-indigo-400 hover:text-indigo-600">&times;</button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 ml-1">Clear all</button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Projects */}
        {filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white overflow-hidden"
              >
                <div className="p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="flex-1"
                    >
                      <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                        {project.title || 'Untitled Project'}
                      </h3>
                    </Link>
                    {project.isPublic && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Public
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {project.description || 'No description available'}
                  </p>

                  {/* Tech tags */}
                  {(project.techStack || project.technologies || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(project.techStack || project.technologies).slice(0, 4).map((tech, i) => (
                        <span
                          key={`${project._id}-t-${i}`}
                          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-600 border border-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.techStack || project.technologies).length > 4 && (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-50 text-gray-400">
                          +{(project.techStack || project.technologies).length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author + actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[11px] font-semibold">
                          {(project.user?.name || project.author?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {project.user?.name || project.author?.name || 'Unknown'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors" title="View code">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Live demo">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors ml-1"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
              {searchTerm || selectedTech
                ? "No projects match your criteria. Try adjusting your filters."
                : "No projects have been shared yet. Be the first to showcase your work."}
            </p>
            {(searchTerm || selectedTech) && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsBrowse;