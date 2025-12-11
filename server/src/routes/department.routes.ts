
import { Router } from 'express';
import * as DeptController from '../controllers/department.controller';

const router = Router();

router.get('/', DeptController.getAllDepartments);
router.post('/', DeptController.createDepartment);
router.put('/:id', DeptController.updateDepartment);
router.delete('/:id', DeptController.deleteDepartment);

export default router;
