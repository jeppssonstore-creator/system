import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, hospital, address } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Användaren finns redan');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'doctor',
    phone: phone || '',
    hospital: hospital || 'Stockholms Läns Sjukvårdsområde',
    address: address || '',
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      hospital: user.hospital,
      address: user.address,
    });
  } else {
    res.status(400);
    throw new Error('Ogiltig användardata');
  }
});

// @desc    Auth user & get token (Inloggning)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      hospital: user.hospital,
      address: user.address,
      linkedDoctorId: user.linkedDoctorId || null,
    });
  } else {
    res.status(401);
    throw new Error('Felaktig e-post eller lösenord');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Utloggad framgångsrikt' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      hospital: user.hospital,
      address: user.address,
      linkedDoctorId: user.linkedDoctorId || null,
    });
  } else {
    res.status(404);
    throw new Error('Användaren hittades inte');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.hospital = req.body.hospital !== undefined ? req.body.hospital : user.hospital;
    user.address = req.body.address !== undefined ? req.body.address : user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      hospital: updatedUser.hospital,
      address: updatedUser.address,
      linkedDoctorId: updatedUser.linkedDoctorId || null,
    });
  } else {
    res.status(404);
    throw new Error('Användaren hittades inte');
  }
});

// @desc    Hämta alla användare (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Radera användare (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Användaren raderades framgångsrikt' });
  } else {
    res.status(404);
    throw new Error('Användaren hittades inte');
  }
});

// @desc    Skapa ny användare av Admin
// @route   POST /api/users/admin-create
// @access  Private/Admin
const createUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, hospital, address, linkedDoctorId } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Användaren finns redan');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'doctor',
    phone: phone || '',
    hospital: hospital || 'Stockholms Läns Sjukvårdsområde',
    address: address || '',
    linkedDoctorId: linkedDoctorId || null,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      hospital: user.hospital,
      address: user.address,
      linkedDoctorId: user.linkedDoctorId,
    });
  } else {
    res.status(400);
    throw new Error('Ogiltig användardata');
  }
});

// @desc    Uppdatera användare som Admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.hospital = req.body.hospital !== undefined ? req.body.hospital : user.hospital;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.linkedDoctorId = req.body.linkedDoctorId !== undefined ? req.body.linkedDoctorId : user.linkedDoctorId;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      hospital: updatedUser.hospital,
      address: updatedUser.address,
      linkedDoctorId: updatedUser.linkedDoctorId,
    });
  } else {
    res.status(404);
    throw new Error('Användaren hittades inte');
  }
});

// @desc    Registrera receptionist kopplad till inloggad läkare (Max 3 st, blockera receptionist)
// @route   POST /api/users/receptionists
// @access  Private (Doctor)
const registerReceptionist = asyncHandler(async (req, res) => {
  const userRole = req.user?.role?.toLowerCase() || '';

  // SÄKERHET 1: Receptionist får inte skapa andra receptionister
  if (userRole === 'receptionist') {
    res.status(403);
    throw new Error('Behörighet saknas: Receptionister kan inte skapa nya receptionister.');
  }

  // SÄKERHET 2: Läkaren får max ha 3 kopplade receptionister (godkänn doctor, doktor, läkare)
  if (userRole === 'doctor' || userRole === 'doktor' || userRole === 'läkare') {
    const receptionistCount = await User.countDocuments({
      role: 'receptionist',
      linkedDoctorId: req.user._id,
    });

    if (receptionistCount >= 3) {
      res.status(400);
      throw new Error('Maxgräns nådd: Du kan inte ha fler än 3 kopplade receptionister.');
    }
  } else {
    res.status(403);
    throw new Error('Behörighet saknas: Endast läkare kan registrera receptionister.');
  }

  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('E-postadressen används redan');
  }

  const receptionist = await User.create({
    name,
    email,
    password,
    role: 'receptionist',
    linkedDoctorId: req.user._id, // Kopplas till inloggad läkare
  });

  if (receptionist) {
    res.status(201).json({
      _id: receptionist._id,
      name: receptionist.name,
      email: receptionist.email,
      role: receptionist.role,
      linkedDoctorId: receptionist.linkedDoctorId,
    });
  } else {
    res.status(400);
    throw new Error('Ogiltig användardata för receptionist');
  }
});

// @desc    Hämta alla receptionister kopplade till inloggad läkare
// @route   GET /api/users/receptionists
// @access  Private (Doctor)
const getDoctorReceptionists = asyncHandler(async (req, res) => {
  const userRole = req.user?.role?.toLowerCase() || '';

  // Godkänn alla varianter av läkare
  if (userRole !== 'doctor' && userRole !== 'doktor' && userRole !== 'läkare') {
    res.status(403);
    throw new Error('Behörighet saknas: Endast läkare kan hämta sina kopplade receptionister.');
  }

  const receptionists = await User.find({
    role: 'receptionist',
    linkedDoctorId: req.user._id,
  }).select('-password');

  res.json(receptionists);
});

export {
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
};