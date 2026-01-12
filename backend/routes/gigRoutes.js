import express from 'express';
import {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs,
} from '../controllers/gigController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllGigs);
router.post('/', protect, createGig);
router.get('/my/posted', protect, getMyGigs);
router.get('/:id', getGigById);
router.put('/:id', protect, updateGig);
router.delete('/:id', protect, deleteGig);

export default router;
