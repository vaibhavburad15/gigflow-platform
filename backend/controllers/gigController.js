import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

// @desc    Get all gigs with optional search
// @route   GET /api/gigs
// @access  Public
export const getAllGigs = async (req, res) => {
  try {
    const { search, status = 'open' } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching gigs',
    });
  }
};

// @desc    Get single gig by ID
// @route   GET /api/gigs/:id
// @access  Public
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      'ownerId',
      'name email'
    );

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    res.status(200).json({
      success: true,
      gig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching gig',
    });
  }
};

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private
export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    // Validation
    if (!title || !description || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id,
    });

    const populatedGig = await Gig.findById(gig._id).populate(
      'ownerId',
      'name email'
    );

    res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      gig: populatedGig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating gig',
    });
  }
};

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Owner only)
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Check ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this gig',
      });
    }

    const { title, description, budget } = req.body;

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (budget) gig.budget = budget;

    await gig.save();

    const updatedGig = await Gig.findById(gig._id).populate(
      'ownerId',
      'name email'
    );

    res.status(200).json({
      success: true,
      message: 'Gig updated successfully',
      gig: updatedGig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating gig',
    });
  }
};

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner only)
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Check ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this gig',
      });
    }

    // Delete all bids associated with this gig
    await Bid.deleteMany({ gigId: req.params.id });

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gig deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting gig',
    });
  }
};

// @desc    Get user's posted gigs
// @route   GET /api/gigs/my/posted
// @access  Private
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your gigs',
    });
  }
};
