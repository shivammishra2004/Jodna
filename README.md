# JODNA - Jira Off Developers, Now for Artists
**Create. Review. Collaborate. — All in Express.**

<div align="center">
  <img src="https://via.placeholder.com/720x400?text=JODNA+Demo+Video+Placeholder" alt="JODNA Demo" width="720" />
  <p><strong>See JODNA in action: Create → Assign → Review → Iterate</strong></p>
</div>

JODNA is a lightweight, designer-focused ticket and review system built as an **Adobe Express add-on**.  
Inspired by the Hindi/Urdu word "जोड़ना" (jodna) meaning *to join* or *to connect*, JODNA seamlessly connects design teams, feedback loops, visual assets, and iterative workflows — without the complexity of full-scale tools like Jira.

## 📋 Table of Contents
- [Why JODNA?](#why-jodna)
- [✨ Key Features](#-key-features)
- [🛠️ Technical Details](#-technical-details)
  - [Tech Stack](#tech-stack)
  - [Database Schema](#database-schema)
  - [Project Structure](#project-structure)
- [🚀 Setup & Installation](#-setup--installation)
- [🔄 Workflows](#-workflows)
  - [Local Development](#local-development)
  - [Deployment (POC)](#deployment-poc)
- [📄 License](#-license)

---

## Why JODNA?

Most ticket tools are built for engineers — JODNA is built for **designers**.  
It removes friction from feedback cycles, asset sharing, and revisions while staying minimal and integrated where designers already work: inside **Adobe Express**.

---

## ✨ Key Features

### 🏢 Organization & Role Management
- **Admin-led Workspaces**: Admins create isolated organizations.
- **Invite-Only Access**: Join via unique invite codes.
- **Role-based Access Control**: 
  - `ADMIN`: Full control over org, projects, and users.
  - `MANAGER`: Can manage projects and tickets.
  - `DESIGNER`: Focus on tickets and assets.

### 📁 Project & Ticket Management
- **Project Structure**: Organize work into projects (Active/Closed).
- **Lightweight Tickets**: Assign tasks with titles, descriptions, and deadlines.
- **Rich Attachments**: Admins attach reference images directly to tickets.
- **Express Project Linking**: Designers can link their Adobe Express projects to tickets.

### 🔄 Review & Iteration Workflow
- **Linear Review Log**: A GitHub-issue style history of all feedback.
- **Visual Feedback**: Admin comments can include image attachments.
- **Status Workflow**: `Open` → `InProgress` → `Review` → `Done`.

### 🧠 AI-Powered Productivity
- **Smart To-Dos**: Uses **Google Gemini API** to automatically break down ticket descriptions into actionable checklists.

### 🖼️ Asset Library
- **Shared Assets**: Central repository for brand assets/logos accessible to the whole org.
- **Secure Storage**: Assets stored directly in MongoDB (Buffer) for small-scale portability (POC).

### 🔐 Security
- **Authentication**: Google OAuth 2.0 & Local (Email/Password).
- **Authorization**: Session-based auth with JWT support.

---

## 🛠️ Technical Details

### Tech Stack

#### **Frontend (Adobe Express Add-on)**
- **Framework**: React `v18.2.0`
- **UI System**: Adobe Spectrum Web Components (`@swc-react/*`)
- **Styling**: Vanilla CSS + Spectrum Design Tokens
- **Build Tool**: Webpack 5 (via `@adobe/ccweb-add-on-scripts`)
- **HTTP Client**: Axios

#### **Backend (API Server)**
- **Runtime**: Node.js
- **Framework**: Express.js `v5.2.1`
- **Database**: MongoDB (Mongoose ODM)
- **AI**: Google Generative AI (Gemini)
- **File Handling**: Multer (Memory Storage)

---

### Database Schema

The database is designed around 6 core models:

#### 1. **User**
| Field | Type | Description |
|-------|------|-------------|
| `displayName` | String | User's full name |
| `email` | String | Unique email address |
| `role` | Enum | `ADMIN`, `MANAGER`, `DESIGNER` |
| `organization` | ObjectId | Reference to `Organization` |

#### 2. **Organization**
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Org name |
| `owner` | ObjectId | User who owns the org |
| `inviteCode` | String | Unique code for joining |

#### 3. **Project**
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Project name |
| `status` | Enum | `Active`, `Closed` |
| `organization` | ObjectId | Links project to org |

#### 4. **Ticket**
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Task title |
| `status` | Enum | `Open`, `InProgress`, `Review`, `Done` |
| `todos` | Array | List of subtasks `{ text, isCompleted }` |
| `attachments` | Array | Buffer data of reference images |
| `expressProjectLink`| String | Link to Adobe Express file |

#### 5. **Review**
| Field | Type | Description |
|-------|------|-------------|
| `ticket` | ObjectId | One-to-one link with Ticket |
| `comments` | Array | Linear log of text + attachments |

#### 6. **Asset**
| Field | Type | Description |
|-------|------|-------------|
| `data` | Buffer | Binary image data |
| `organization` | ObjectId | Org who owns the asset |

---

### Project Structure

```
JODNA/
├── backend/                  # Express Server
│   ├── config/               # DB & Auth setup
│   ├── middleware/           # Auth checks
│   ├── models/               # Mongoose Schemas (User, Ticket, etc.)
│   ├── routes/               # API Routes (auth, tickets, ai, etc.)
│   ├── server.js             # Entry point
│   └── .env                  # Secrets
│
├── frontend/                 # Adobe Express Add-on
│   ├── src/                  # React Source
│   │   ├── components/       # UI Components
│   │   ├── config.js         # API URL config
│   │   └── App.jsx           # Main generic entry
│   ├── package.json          # Dependencies
│   └── webpack.config.js     # Build config
│
├── DEPLOYMENT_GUIDE.md       # Detailed deployment production steps
└── README.md                 # Project documentation
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Adobe Express Account

### 1. Clone & Install
```bash
git clone https://github.com/Sparshkalia/Jodna.git
cd JODNA
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jodna
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
SESSION_SECRET=your-secret
FRONTEND_URL=https://localhost:5241
GEMINI_API_KEY=your-gemini-key
```
Start the server:
```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
# Dev server runs on https://localhost:5241
```

### 4. Load in Adobe Express
1. Go to [Adobe Express](https://new.express.adobe.com/).
2. Open the **Add-ons** panel (left sidebar).
3. Enable **Developer Mode**.
4. Click **Connect local add-on**.
5. Enter: `https://localhost:5241`.

---

## 🔄 Workflows

### Local Development
1. **Run Backend**: `npm start` in `/backend`.
2. **Run Frontend**: `npm start` in `/frontend`.
3. **Testing**:
   - Access API at `http://localhost:5000`.
   - Access UI inside Adobe Express via the Add-on panel.
   - **Note**: Ensure `FRONTEND_URL` in `.env` matches your add-on's origin.

### Deployment (POC)
For private distribution as a Proof of Concept:

1. **Deploy Backend**: 
   - Push `/backend` to GitHub.
   - Deploy on **Render.com** (Web Service).
   - Set Environment Variables on Render.

2. **Package Frontend**:
   - Update `frontend/src/config.js` with new Backend URL.
   - Run `npm run package` in `/frontend`.
   - Generates a `.zip` file.

3. **Distribute**:
   - Upload `.zip` to **Adobe Express Add-on Console**.
   - Create a **Private Link**.
   - Share link with testers.

*See `DEPLOYMENT_GUIDE.md` for full details.*

---

## 📄 License
This project is licensed under the MIT License.
