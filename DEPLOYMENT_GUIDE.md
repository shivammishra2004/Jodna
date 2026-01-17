
# JODNA Deployment Guide (POC)

This guide walks you through deploying the **Backend** and packaging the **Frontend** for private distribution as an Adobe Express Add-on.

## Part 1: Deploy the Backend

Since the Adobe Add-on runs in the user's browser (on the web), it cannot access your `localhost`. You must deploy your backend to a public server. We recommend **Render** as it is free and easy for Node.js.

### Prerequisites
1.  Push your code to **GitHub**.
2.  Have your **MongoDB Connection String** (MONGO_URI) ready.

### Steps on Render.com
1.  **Sign up/Log in** to [Render.com](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  **Connect your GitHub repository**.
4.  **Configure the service**:
    *   **Name**: `jodna-backend` (or similar)
    *   **Root Directory**: `backend` (Important! Your server.js is inside the backend folder)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables** (Advanced section):
    *   Add the variables from your `.env` file:
        *   `MONGO_URI`: `your_mongodb_connection_string`
        *   `JWT_SECRET`: `your_secret_key`
        *   `GOOGLE_CLIENT_ID`: (if using Google Auth)
        *   `GOOGLE_CLIENT_SECRET`: (if using Google Auth)
6.  Click **Create Web Service**.
7.  Wait for deployment. Once live, copy the **Service URL** (e.g., `https://jodna-backend.onrender.com`).

---

## Part 2: Update Frontend Configuration

Now that you have a live backend URL, tell the frontend to use it.

1.  Open `frontend/src/config.js`.
2.  Update the `BACKEND_URL` with your new Render URL:

```javascript
const config = {
    // Replace with your actual deployed URL (no trailing slash)
    BACKEND_URL: "https://jodna-backend.onrender.com" 
};
export default config;
```

---

## Part 3: Package the Add-on

1.  Open your terminal in VS Code.
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  Build and package the add-on:
    ```bash
    npm run package
    ```
4.  This will create a `dist.zip` file in the `frontend` (or project root) directory.

---

## Part 4: Create Private Share Link

1.  Go to [Adobe Express Add-ons Manager](https://new.express.adobe.com/add-ons/manage).
2.  Click **Create new add-on**.
3.  **Upload** the `dist.zip` file.
4.  Fill in the required metadata (Name, Description, Icon, **Screenshot**).
    *   *Note: Even for private links, 1 screenshot is required.*
5.  Once verified (Green Checkmark), go to the **Share / Distribute** tab.
6.  Select **Create Private Link**.
7.  Copy the link and share it!

### Troubleshooting
*   **CORS Errors**: If the add-on fails to fetch data, ensure your Backend `server.js` allows the Origin. Currently, it is set to `origin: true`, which should work.
*   **Authentication**: If Google Login fails, you may need to add your new Render domain or Adobe Express domain to the "Authorized Redirect URIs" in your Google Cloud Console.
