
import { Router } from 'express';
import * as ReportController from '../controllers/report.controller';

const router = Router();

// Definitions
router.get('/definitions', ReportController.getDefinitions);
router.post('/definitions', ReportController.createDefinition);
router.get('/definitions/:id', ReportController.getDefinitionById);
router.put('/definitions/:id', ReportController.updateDefinition);
router.delete('/definitions/:id', ReportController.deleteDefinition);

// Submissions
router.get('/', ReportController.getSubmissions); // Note: path is relative to /api/submissions (or similar mount point)
// WARNING: In original index.ts, submissions were at /api/submissions
// But definitions were at /api/reports/definitions.
// I'll need to coordinate the mounting points carefully in routes/index.ts

export default router;
