import express from 'express';
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  createUserByAdmin,
  updateUserByAdmin,
  registerReceptionist,
  getDoctorReceptionists,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);

// Läkare kan hämta och registrera sina receptionister
router.route('/receptionists')
  .get(protect, getDoctorReceptionists)
  .post(protect, registerReceptionist);

// Admin-routar
router.route('/admin-create').post(protect, admin, createUserByAdmin);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUserByAdmin);

export default router;