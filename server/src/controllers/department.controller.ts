
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDepartments = async (req: Request, res: Response) => {
    try {
        const depts = await prisma.department.findMany({
            include: { _count: { select: { users: true } } }
        });
        res.json(depts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { name, code } = req.body;
        const dept = await prisma.department.create({
            data: { name, code }
        });
        res.json(dept);
    } catch (error: any) {
        console.error('Create department error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Code already exists' });
        }
        res.status(500).json({ error: 'Failed to create department' });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { name, code } = req.body;
        const dept = await prisma.department.update({
            where: { id: req.params.id },
            data: { name, code }
        });
        res.json(dept);
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        await prisma.department.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete department error:', error);
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete department with existing users or reports' });
        }
        res.status(500).json({ error: 'Failed to delete department' });
    }
};
