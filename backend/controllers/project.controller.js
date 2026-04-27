const Project = require('../models/project.model');

const createProject = async (req, res) => {
 try {
  const { title, description, techStack, githubUrl, liveUrl, isPublic } = req.body;
  
  // Create project with logged-in user as owner
  const project = await Project.create({
    owner: req.user.id,
    title,
    description,
    techStack,
    githubUrl,
    liveUrl,
    isPublic,
  });

  await project.populate('owner', 'name email');
  res.status(201).json({ message: "Project created successfully", project});
 } catch (error) {
  console.log('Create project error: ', error);
  res.status(400).json({ message: "Failed to create project", error: error.message });
 }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('owner', 'name email role') // 🔧 Add role
      .sort({ createdAt: -1 });

    // 🔧 Transform projects to use 'user' field for frontend consistency
    const transformedProjects = projects.map(project => {
      const projectObj = project.toObject();
      return {
        ...projectObj,
        user: projectObj.owner, // Map owner to user
        views: projectObj.views || 0
      };
    });

    res.json({ 
      success: true, // 🔧 Add success field
      message: "Projects retrieved successfully", 
      projects: transformedProjects, // 🔧 Use transformed projects
      count: transformedProjects.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, // 🔧 Add success field
      message: "Failed to retrieve projects", 
      error: error.message 
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isPublic: true })
      .populate('owner', 'name email role') // 🔧 Keep as 'owner'
      .sort({ createdAt: -1 });

    // 🔧 Transform projects to use 'user' field for frontend consistency
    const transformedProjects = projects.map(project => {
      const projectObj = project.toObject();
      return {
        ...projectObj,
        user: projectObj.owner, // Map owner to user
        views: projectObj.views || 0
      };
    });

    res.json({
      success: true, // 🔧 Add success field
      message: "Public projects retrieved successfully",
      projects: transformedProjects, // 🔧 Use transformed projects
      count: transformedProjects.length
    });  
  } catch (error) {
    res.status(500).json({ 
      success: false, // 🔧 Add success field
      message: "Failed to retrieve projects", 
      error: error.message 
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if project is public OR user is the owner
    if (!project.isPublic && project.owner._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Private project"
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'name email role');

    const projectResponse = {
      ...project.toObject(),
      user: project.owner,
      views: project.views || 0
    };

    delete projectResponse.owner;

    res.json({
      success: true,
      message: "Project retrieved successfully",
      project: projectResponse
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve project",
      error: error.message
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied - Not the project owner"
      });
    }

    const { title, description, techStack, githubUrl, liveUrl, isPublic } = req.body;

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        techStack,
        githubUrl,
        liveUrl,
        isPublic
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      message: "Project updated successfully",
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(400).json({
      message: "Failed to update project",
      error: error.message
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied - Not the project owner"
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: "Failed to delete project",
      error: error.message
    });
  }
};

const searchProjects = async (req, res) => {
  try {
    const { search, tech, isPublic } = req.query;
    
    let query = {};
    
    // If user is recruiter, only show public projects
    if (req.user.role === 'recruiter' || isPublic === 'true') {
      query.isPublic = true;
    } else {
      // If student, show their own projects + public ones
      query.$or = [
        { owner: req.user.id }, // 🔧 FIX: Use 'owner' not 'user'
        { isPublic: true }
      ];
    }

    // Add text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tech filter
    if (tech) {
      query.techStack = { $in: [tech] };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email role') // 🔧 FIX: Use 'owner' not 'user'
      .sort({ createdAt: -1 });

    // 🔧 Transform projects for frontend consistency
    const transformedProjects = projects.map(project => {
      const projectObj = project.toObject();
      return {
        ...projectObj,
        user: projectObj.owner, // Map owner to user
        views: projectObj.views || 0
      };
    });

    res.json({
      success: true,
      projects: transformedProjects, // 🔧 Use transformed projects
      count: transformedProjects.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { 
  createProject, 
  getMyProjects, 
  getAllProjects, 
  getProjectById,
  updateProject,
  deleteProject,
  searchProjects,
};