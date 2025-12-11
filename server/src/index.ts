import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Mount Routes
app.use('/auth', authRoutes); // /auth/login

app.use('/api', apiRoutes);   // /api/users, /api/submissions, etc.

// Serve static files from the React app
// Adjust the path to point to the frontend build directory
const frontendBuildPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendBuildPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

