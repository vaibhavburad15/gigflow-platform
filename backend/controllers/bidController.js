import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

// @desc    Submit a bid on a gig
// @route   POST /api/bids
// @access  Private
export const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Validation
    if (!gigId || !message || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This gig is no longer accepting bids',
      });
    }

    // Prevent owner from bidding on their own gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own gig',
      });
    }

    // Check if user already submitted a bid
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this gig',
      });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price,
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      bid: populatedBid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating bid',
    });
  }
};

// @desc    Get all bids for a specific gig
// @route   GET /api/bids/:gigId
// @access  Private (Gig owner only)
export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Check if user is the gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bids for this gig',
      });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching bids',
    });
  }
};

// @desc    Hire a freelancer (Accept a bid) - WITH TRANSACTION
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Gig owner only)
export const hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find the bid with session
    const bid = await Bid.findById(bidId).populate('gigId').session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Find the gig
    const gig = await Gig.findById(bid.gigId._id).session(session);

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Check if user is the gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to hire for this gig',
      });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned',
      });
    }

    // CRITICAL ATOMIC OPERATIONS:
    // 1. Update the gig status to 'assigned'
    gig.status = 'assigned';
    gig.hiredBidId = bid._id;
    await gig.save({ session });

    // 2. Update the chosen bid to 'hired'
    bid.status = 'hired';
    await bid.save({ session });

    // 3. Reject all other bids for this gig
    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bid._id },
        status: 'pending',
      },
      { status: 'rejected' },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Populate the hired bid for response
    const hiredBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title description budget');

    // Get all rejected bids for notification
    const rejectedBids = await Bid.find({
      gigId: gig._id,
      status: 'rejected',
    }).populate('freelancerId', '_id name email');

    // ===== BONUS 2: REAL-TIME NOTIFICATIONS =====
    // Send real-time notification to the hired freelancer
    const io = req.app.get('io');
    const userSockets = req.userSockets;

    if (userSockets && hiredBid.freelancerId._id) {
      const freelancerSocketId = userSockets.get(
        hiredBid.freelancerId._id.toString()
      );

      if (freelancerSocketId) {
        io.to(freelancerSocketId).emit('hired', {
          message: `🎉 Congratulations! You have been hired for "${hiredBid.gigId.title}"!`,
          gig: {
            id: hiredBid.gigId._id,
            title: hiredBid.gigId.title,
            budget: hiredBid.gigId.budget,
          },
          bid: {
            id: hiredBid._id,
            price: hiredBid.price,
          },
        });
        console.log(
          `📨 Sent hiring notification to user ${hiredBid.freelancerId._id}`
        );
      }
    }

    // Send rejection notifications to other freelancers
    rejectedBids.forEach((rejectedBid) => {
      if (userSockets && rejectedBid.freelancerId._id) {
        const socketId = userSockets.get(
          rejectedBid.freelancerId._id.toString()
        );
        if (socketId) {
          io.to(socketId).emit('bidRejected', {
            message: `Your bid for "${gig.title}" was not selected.`,
            gigId: gig._id,
            bidId: rejectedBid._id,
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully',
      bid: hiredBid,
      rejectedBids: rejectedBids,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message || 'Server error during hiring process',
    });
  }
};

// @desc    Get user's submitted bids
// @route   GET /api/bids/my/bids
// @access  Private
export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId', 'title description budget status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your bids',
    });
  }
};
