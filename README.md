# Resume Builder - AI-Powered Job Matching Platform

A comprehensive MERN stack application that helps job seekers match their resumes with job descriptions using AI, get improvement suggestions, and discover relevant jobs across multiple job portals.

## Features

### 🎯 Core Features
- **Resume Upload & Parsing**: Upload PDF/DOCX resumes with automatic text extraction and section parsing
- **AI-Powered Matching**: Get match scores (0-100) comparing your resume with job descriptions
- **Score Breakdown**: Detailed analysis including:
  - Semantic Match (experience alignment)
  - Keyword Match (skill coverage)
  - Role Alignment (career progression fit)
- **Keyword Suggestions**: Get AI-powered recommendations for missing keywords to improve your resume
- **Job Portal Scanning**: Automatically scan multiple job portals (Indeed, Glassdoor, etc.) using AI
- **Job Recommendations**: Get personalized job recommendations based on your resume
- **Match History**: Track all your resume matches with job descriptions

### 🔧 Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **AI Integration**: 
  - OpenAI (GPT-4) for resume matching and keyword suggestions
  - Groq (Llama 3.1) for job portal scanning and search optimization
- **File Processing**: PDF parsing, DOCX parsing
- **Authentication**: JWT-based authentication

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- OpenAI API Key
- Groq API Key

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Resume Builder"
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup

#### Server Environment Variables
Create `server/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:5173
```

#### Client Environment Variables
Create `client/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Create Upload Directory
```bash
mkdir server/uploads
```

## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Start the Server
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

### Start the Client
```bash
cd client
npm run dev
```
Client will run on `http://localhost:5173`

## Project Structure

```
Resume Builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── services/          # Business logic
│   │   ├── aiService.js   # AI integration
│   │   ├── jobScraper.js  # Job portal scraping
│   │   └── resumeParser.js # Resume parsing
│   ├── middleware/        # Express middleware
│   ├── uploads/          # Uploaded resume files
│   └── server.js          # Server entry point
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Resumes
- `POST /api/resumes` - Upload resume (multipart/form-data)
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get resume by ID
- `DELETE /api/resumes/:id` - Delete resume

### Matching
- `POST /api/match` - Match resume with job description
- `GET /api/match` - Get all matches
- `GET /api/match/:id` - Get match by ID
- `GET /api/match/suggestions/:matchId` - Get keyword suggestions

### Jobs
- `POST /api/jobs/scan` - Scan job portals
- `GET /api/jobs/recommended` - Get recommended jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/:id/save` - Save job
- `POST /api/jobs/:id/apply` - Mark job as applied
- `POST /api/jobs/:id/ignore` - Ignore job

## Usage Guide

### 1. Register/Login
- Create an account or login with existing credentials

### 2. Upload Resume
- Navigate to "Upload" page
- Select a PDF or DOCX file
- System will automatically parse and extract text

### 3. Match Resume
- Go to "Match" page
- Select your resume
- Paste or enter job description
- Click "Get Match Score" to get:
  - Overall match score
  - Detailed breakdown
  - Missing keywords
  - Improvement suggestions

### 4. Find Jobs
- Go to "Jobs" page
- Select your resume
- Click "Scan Job Portals"
- System will scan job portals and show relevant jobs with match scores

### 5. View History
- Check "History" page to see all your previous matches

## AI Integration Details

### OpenAI (GPT-4)
- **Resume Matching**: Analyzes resume vs job description
- **Keyword Suggestions**: Identifies missing keywords
- **Embeddings**: Generates text embeddings for semantic matching

### Groq (Llama 3.1)
- **Job Search Optimization**: Generates optimal search queries
- **Job Portal Scanning**: Helps identify relevant jobs across portals

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- CORS configuration
- Rate limiting (can be added)

## Future Enhancements
- [ ] Resume templates
- [ ] Resume builder
- [ ] Email notifications for new jobs
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Resume versioning
- [ ] Export match reports
- [ ] Integration with more job portals
- [ ] Chrome extension for job application tracking

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### File Upload Issues
- Check file size (max 5MB)
- Ensure file is PDF or DOCX format
- Verify uploads directory exists

### AI API Issues
- Verify API keys are correct
- Check API quota/limits
- Ensure internet connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the repository.

