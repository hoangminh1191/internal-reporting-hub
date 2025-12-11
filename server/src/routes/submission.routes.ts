
import { Router } from 'express';
import * as ReportController from '../controllers/report.controller';

const router = Router();

router.get('/', ReportController.getSubmissions);
router.post('/', ReportController.createSubmission);
router.get('/:id', ReportController.getSubmissionById);
router.put('/:id', ReportController.updateSubmission);

export default router;
