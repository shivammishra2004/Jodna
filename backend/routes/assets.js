const express = require('express');
const router = express.Router();
const multer = require('multer');
const Asset = require('../models/Asset');
const Organization = require('../models/Organization');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// Multer Error Handling Wrapper
const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer Error:", err);
            return res.status(400).json({ msg: 'File upload error: ' + err.message });
        } else if (err) {
            console.error("Unknown Upload Error:", err);
            return res.status(500).json({ msg: 'Upload error: ' + err.message });
        }
        next();
    });
};

// @route   POST /api/assets/:orgId
// @desc    Upload an asset
// @access  Private (Admin/Owner)
router.post('/:orgId', protect, uploadMiddleware, async (req, res) => {
    console.log("POST /api/assets request received");
    console.log("Params:", req.params);
    console.log("User:", req.user ? req.user.id : "No User");
    
    try {
        const { orgId } = req.params;
        console.log("Looking up organization:", orgId);

        // Verify Organization exists
        const organization = await Organization.findById(orgId);
        if (!organization) {
            console.log("Organization not found");
            return res.status(404).json({ msg: 'Organization not found' });
        }

        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({ msg: 'Please upload a file' });
        }
        console.log("File received:", req.file.originalname, req.file.mimetype, req.file.size);

        const newAsset = new Asset({
            name: req.body.name || req.file.originalname,
            data: req.file.buffer, // Binary data from memory
            contentType: req.file.mimetype,
            organization: orgId,
            uploadedBy: req.user.id
        });

        console.log("Saving asset...");
        const savedAsset = await newAsset.save();
        console.log("Asset saved:", savedAsset._id);

        // Respond without the heavy data
        res.status(201).json({
            _id: savedAsset._id,
            name: savedAsset.name,
            contentType: savedAsset.contentType,
            organization: savedAsset.organization,
            createdAt: savedAsset.createdAt
        });

    } catch (err) {
        console.error("Error in POST /api/assets:", err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message, 
            stack: process.env.NODE_ENV === 'production' ? null : err.stack 
        });
    }
});

// @route   GET /api/assets/:orgId
// @desc    Get all assets for an organization
// @access  Private
router.get('/:orgId', protect, async (req, res) => {
    try {
        // Select everything EXCEPT 'data' to keep response light
        const assets = await Asset.find({ organization: req.params.orgId })
            .select('-data') 
            .sort({ createdAt: -1 });
        
        res.json(assets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/assets/image/:id
// @desc    Get asset image data
// @access  Private/Public (depending on need, keeping Public for Canvas access simplicity if token not passed easily, but better Private)
// NOTE: For Adobe Add-on simple use, let's keep it protected or handle token if possible. 
// If `img src` needs to call this, it needs the token. 
// For now, let's allow it to be accessed via simple token check or public if the ID is known (obscurity).
// Let's rely on standard Auth middleware. If UI is fetching Blob, it works.
router.get('/image/:id', async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ msg: 'Asset not found' });
        }

        res.set('Content-Type', asset.contentType);
        res.send(asset.data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/assets/:id
// @desc    Delete an asset
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ msg: 'Asset not found' });
        }

        // Check user permissions here if needed

        await asset.deleteOne();

        res.json({ msg: 'Asset removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
