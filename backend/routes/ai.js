const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');

/**
 * @route   POST /api/ai/generate-description
 * @desc    Generate project description using AI
 * @access  Private (Student, Leader)
 */
router.post('/generate-description', authenticate, async (req, res) => {
  try {
    // Check if AI is enabled
    if (!aiService.isAIEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please contact administrator.'
      });
    }

    const { projectName, techStack, additionalInfo } = req.body;

    // Validation
    if (!projectName || projectName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Generate description
    const generatedContent = await aiService.generateProjectDescription(
      projectName,
      techStack,
      additionalInfo
    );

    res.json({
      success: true,
      data: generatedContent,
      message: 'Project description generated successfully'
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate project description'
    });
  }
});

/**
 * @route   POST /api/ai/generate-name-suggestions
 * @desc    Generate project name suggestions
 * @access  Private
 */
router.post('/generate-name-suggestions', authenticate, async (req, res) => {
  try {
    if (!aiService.isAIEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    const { keywords, count = 5 } = req.body;

    if (!keywords || keywords.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Keywords are required'
      });
    }

    const suggestions = await aiService.generateProjectNameSuggestions(keywords, count);

    res.json({
      success: true,
      data: { suggestions },
      message: 'Project name suggestions generated'
    });
  } catch (error) {
    console.error('Generate name suggestions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate name suggestions'
    });
  }
});

/**
 * @route   POST /api/ai/improve-description
 * @desc    Improve existing project description
 * @access  Private
 */
router.post('/improve-description', authenticate, async (req, res) => {
  try {
    if (!aiService.isAIEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    const { description } = req.body;

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const improvedDescription = await aiService.improveProjectDescription(description);

    res.json({
      success: true,
      data: { improvedDescription },
      message: 'Description improved successfully'
    });
  } catch (error) {
    console.error('Improve description error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to improve description'
    });
  }
});

/**
 * @route   POST /api/ai/generate-objectives
 * @desc    Generate project objectives based on description
 * @access  Private
 */
router.post('/generate-objectives', authenticate, async (req, res) => {
  try {
    if (!aiService.isAIEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    const { description } = req.body;

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const objectives = await aiService.generateObjectives(description);

    res.json({
      success: true,
      data: { objectives },
      message: 'Objectives generated successfully'
    });
  } catch (error) {
    console.error('Generate objectives error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate objectives'
    });
  }
});

/**
 * @route   GET /api/ai/status
 * @desc    Check if AI service is available
 * @access  Private
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const isEnabled = aiService.isAIEnabled();
    
    res.json({
      success: true,
      data: {
        enabled: isEnabled,
        features: isEnabled ? [
          'generate-description',
          'generate-name-suggestions',
          'improve-description',
          'generate-objectives'
        ] : []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check AI status'
    });
  }
});

module.exports = router;
