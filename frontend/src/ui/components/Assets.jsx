import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Assets.css';

import config from "../../config";
const { BACKEND_URL } = config;

const Assets = ({ user, sandboxProxy, organization }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Filter by role for upload capability
    const canUpload = user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'OWNER';

    useEffect(() => {
        if (organization) {
            fetchAssets();
        }
    }, [organization]);

    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/assets/${organization._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssets(res.data);
        } catch (err) {
            console.error("Failed to fetch assets", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${BACKEND_URL}/api/assets/${organization._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            // Add new asset to list
            setAssets([res.data, ...assets]);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = null;
        }
    };

    const handleAssetClick = async (asset) => {
        if (!sandboxProxy) {
            console.warn("Sandbox proxy not available");
            return;
        }

        try {
            // We need to fetch the blob to pass it to the sandbox, 
            // OR pass the URL if the sandbox can handle valid URLs (but localhost URLs might be tricky in some sandbox environments).
            // For Adobe Express Add-ons, passing a Blob or Base64 is often safer if the URL isn't public.
            // Let's try fetching the Blob here and passing it as an ArrayBuffer or Blob.

            // NOTE: This part depends on Step 3 (Sandbox Integration). 
            // For now, we will just log or attempt to call the future API.
            console.log("Adding asset to canvas:", asset.name);

            // Fetch the image data
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/assets/image/${asset._id}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = response.data;

            // Convert to ArrayBuffer or Base64 as needed by the sandbox. 
            // Usually sandbox APIs might take a generic object or blob ref.
            // Looking at `sandbox/code.js`, we need to implement `createImage`.

            if (sandboxProxy.createImage) {
                await sandboxProxy.createImage(blob);
            } else {
                console.log("createImage API not yet implemented in sandbox.");
            }

        } catch (err) {
            console.error("Error adding asset to canvas:", err);
        }
    };

    const handleDelete = async (e, assetId) => {
        e.stopPropagation(); // Prevent clicking the card
        console.log("Delete button clicked for asset:", assetId);

        // if (!window.confirm("Delete this asset?")) {
        //     console.log("Delete cancelled by user");
        //     return;
        // }
        console.log("Skipping confirmation (debug mode)");

        try {
            console.log("Sending DELETE request...");
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BACKEND_URL}/api/assets/${assetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Delete response:", response.status, response.data);
            setAssets(assets.filter(a => a._id !== assetId));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed: " + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div className="assets-container">
            <div className="assets-header">

                {canUpload && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <button className="btn-primary btn-upload" onClick={handleUploadClick} disabled={uploading}>
                            {uploading ? 'Uploading...' : '+ Upload Asset'}
                        </button>
                    </>
                )}
            </div>

            {loading ? (
                <p>Loading assets...</p>
            ) : assets.length === 0 ? (
                <div className="no-assets">
                    <p>No assets found. Upload some to get started!</p>
                </div>
            ) : (
                <div className="assets-grid">
                    {assets.map(asset => (
                        <div
                            key={asset._id}
                            className="asset-card"
                            onClick={() => handleAssetClick(asset)}
                            title="Click to add to canvas"
                        >
                            <div className="asset-image-container">
                                {canUpload && (
                                    <button
                                        className="btn-delete"
                                        onClick={(e) => handleDelete(e, asset._id)}
                                        title="Delete Asset"
                                    >
                                        ✕
                                    </button>
                                )}
                                <img
                                    src={`${BACKEND_URL}/api/assets/image/${asset._id}`}
                                    alt={asset.name}
                                    className="asset-image"
                                    loading="lazy"
                                />
                            </div>
                            <div className="asset-info">
                                <div className="asset-name">{asset.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Assets;
