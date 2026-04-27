const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middlewares/auth.middleware');
const { 
  createProject, 
  getMyProjects, 
  getAllProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  searchProjects 
} = require('../controllers/project.controller');

// routes require authentication
router.use(verifyAuth);

// POST /api/projects
router.post('/', createProject);

// GET /api/projects/my
router.get('/my', getMyProjects);

// GET /api/projects
router.get('/', getAllProjects);

// GET /api/projects/:id
router.get('/:id', getProjectById);

// PUT /api/projects/:id
router.put('/:id', updateProject);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);

// 
router.get('/search', searchProjects);

module.exports = router;