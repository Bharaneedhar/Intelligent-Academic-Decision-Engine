const User = require('../models/User');
const { generateAndSaveRoadmap } = require('../services/roadmapService');

// @desc    Complete user profile setup
// @route   PUT /api/profile/setup
// @access  Private
const completeProfile = async (req, res) => {
    const { roleIds, customRoleTitle, roleAssessments, customRoleRating } = req.body;
    const userId = req.user.id;

    if ((!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) && !customRoleTitle) {
        return res.status(400).json({ message: "Please select at least one role or provide a custom one" });
    }

    if (roleIds && roleIds.length > 3) {
        return res.status(400).json({ message: "You can select a maximum of 3 roles." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.selectedRoles = roleIds || [];
        user.roleAssessments = roleAssessments || [];
        user.profileComplete = true;
        await user.save();

        // Generate roadmaps for all selected roles
        const roadmaps = [];
        if (roleIds) {
            for (const roleId of roleIds) {
                try {
                    const roadmap = await generateAndSaveRoadmap(userId, roleId);
                    roadmaps.push(roadmap);
                } catch (err) {
                    console.error(`Failed to generate roadmap for role ${roleId}:`, err);
                }
            }
        }

        // Handle custom role if provided during setup
        if (customRoleTitle) {
            try {
                const customRoadmap = await generateAndSaveRoadmap(userId, null, customRoleTitle);
                roadmaps.push(customRoadmap);

                // Add the new role ID to user's roles if it was created
                if (customRoadmap && customRoadmap.role) {
                    user.selectedRoles.push(customRoadmap.role._id);
                    if (customRoleRating) {
                        user.roleAssessments.push({ roleId: customRoadmap.role._id, rating: customRoleRating });
                    }
                    await user.save();
                }
            } catch (err) {
                console.error(`Failed to generate roadmap for custom role ${customRoleTitle}:`, err);
            }
        }

        res.json({
            message: "Profile setup complete",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileComplete: user.profileComplete,
                selectedRoles: user.selectedRoles
            },
            roadmaps
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add additional role to profile
// @route   POST /api/profile/roles/add
// @access  Private
const addRole = async (req, res) => {
    const { roleId, customRoleTitle } = req.body;
    const userId = req.user.id;

    console.log('addRole called with:', { roleId, customRoleTitle, userId });

    if (!roleId && !customRoleTitle) {
        return res.status(400).json({ message: "Please provide a roleId or customRoleTitle" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate roadmap for the new role
        const roadmap = await generateAndSaveRoadmap(userId, roleId || null, customRoleTitle || null);

        if (customRoleTitle && roadmap && roadmap.role) {
            if (!user.selectedRoles.map(r => r.toString()).includes(roadmap.role._id.toString())) {
                user.selectedRoles.push(roadmap.role._id);
                await user.save();
            }
        } else if (roleId) {
            if (!user.selectedRoles.map(r => r.toString()).includes(roleId.toString())) {
                user.selectedRoles.push(roleId);
                await user.save();
            }
        }

        res.json({
            message: "Role added and roadmap generated",
            selectedRoles: user.selectedRoles,
            roadmap
        });
    } catch (error) {
        console.error('addRole Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save academic profile details
// @route   PUT /api/profile/academic
// @access  Private
const saveAcademicProfile = async (req, res) => {
    const { educationLevel, fieldOfStudy, institutionName, yearOfStudy, achievements } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.academicProfile = {
            educationLevel: educationLevel || user.academicProfile?.educationLevel,
            fieldOfStudy: fieldOfStudy || user.academicProfile?.fieldOfStudy,
            institutionName: institutionName || user.academicProfile?.institutionName,
            yearOfStudy: yearOfStudy || user.academicProfile?.yearOfStudy,
            achievements: achievements || user.academicProfile?.achievements,
        };
        await user.save();

        res.json({ message: 'Academic profile saved', academicProfile: user.academicProfile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user name
// @route   PUT /api/profile/update-name
// @access  Private
const updateName = async (req, res) => {
    const { name } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        await user.save();

        res.json({ message: 'Name updated', name: user.name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload profile photo
// @route   POST /api/profile/upload-photo
// @access  Private
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.profileImage = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ message: 'Photo uploaded', profileImage: user.profileImage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    completeProfile,
    addRole,
    saveAcademicProfile,
    updateName,
    uploadPhoto,
};
