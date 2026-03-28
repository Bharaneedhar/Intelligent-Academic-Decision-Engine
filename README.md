# LearnBuddyyy - AI-Assisted Learning Platform

## 🎯 Purpose (Why the project is done)
LearnBuddyyy is a full-stack web application designed to revolutionize the way users learn and track their educational progress. The primary purpose of this project is to provide a structured, personalized, and AI-assisted learning environment. It solves the problem of unstructured learning by offering tailored roadmaps, interactive study modules, and detailed session tracking to ensure users stay on top of their educational goals.

## 🔄 Project Workflow
1. **User Registration & Onboarding:** New users sign up and select their desired role or learning path.
2. **AI-Driven Roadmap Generation:** Based on the selected role, the system (powered by Google Generative AI) generates a personalized learning roadmap consisting of specific topics and modules.
3. **Interactive Learning:** Users navigate through their assigned modules, reading content and taking quizzes to test their knowledge.
4. **Session Tracking:** The platform actively tracks the time spent on learning modules to ensure users meet their daily goals.
5. **Reporting & Analytics:** At the end of a session, users can view their progress on a dashboard and export a comprehensive daily progress report as a PDF.
6. **Admin Oversight:** Administrators have access to a drill-down dashboard to monitor user activity, track overall progress, and manage platform content.

## 💻 Technologies Used
**Frontend:**
- **React + Vite:** For building a fast, component-based user interface.
- **Tailwind CSS:** For modern, responsive styling and rapid UI development.
- **Zustand:** For lightweight global state management.
- **Axios:** For handling API requests.
- **Recharts:** For rendering data visualizations and progress charts.
- **Framer Motion:** For smooth UI animations and transitions.

**Backend:**
- **Node.js + Express:** For a robust and scalable API server.
- **MongoDB (Mongoose):** As the NoSQL database for flexible data storage.
- **JWT (JSON Web Signatures):** For secure user authentication and authorization.
- **Multer:** For handling file uploads (e.g., profile pictures).
- **PDFKit:** For generating dynamic, downloadable PDF reports.
- **Google Generative AI SDK:** For generating AI-assisted personalized learning roadmaps.

## 🌟 Benefits
- **Personalized Experience:** Roadmaps tailored directly to user goals and roles.
- **Efficient Time Management:** Built-in session tracking helps users stay accountable and focused.
- **Measurable Progress:** Visual dashboards and exportable PDF reports make it easy to see daily achievements.
- **Modern & Engaging UI:** A premium, responsive interface ensures a seamless user experience across devices.
- **Scalable Architecture:** The MERN-like stack (React, Node, MongoDB) combined with AI integrations provides a future-proof foundation.

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: recent LTS recommended
- **MongoDB**: local instance or a remote MongoDB URI

### Environment variables
Create a `backend/.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/<dbName>
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_ai_key
```

### Install Dependencies
```bash
# Backend install
cd backend
npm install

# Frontend install
cd ../frontend
npm install
```

### Run Locally (Development)
```bash
# Start backend (API)
cd backend
npm run dev

# Start frontend (UI) in a separate terminal
cd frontend
npm run dev
```

## 🛠️ Troubleshooting
- **API not reachable**: Confirm backend is running and the frontend API base URL matches your backend host/port.
- **Mongo connection errors**: Verify `MONGO_URI` and MongoDB service is running.
- **PDF export fails**: Ensure backend has required env vars and routes are reachable.
