
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import deptRoutes from './department.routes';
import reportRoutes from './report.routes';
import submissionRoutes from './submission.routes';

const router = Router();

// Mount routes
// Auth is handled separately in main index usually or here.
// Original: app.post('/auth/login') -> handled by main app or a separate mount.
// Let's mount everything under /api here, and handle auth separately or include it.
// The original app had /auth/login (not /api/auth/login).

router.use('/users', userRoutes);
router.use('/departments', deptRoutes);
router.use('/reports', reportRoutes); // This will handle /api/reports/definitions
router.use('/submissions', submissionRoutes);

export default router;
