
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Definitions ---

export const getDefinitions = async (req: Request, res: Response) => {
    try {
        const defs = await prisma.reportDefinition.findMany({
            include: { department: true }
        });
        const parsed = defs.map(d => ({
            ...d,
            structure: JSON.parse(d.structure),
            departmentName: d.department?.name
        }));
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch definitions' });
    }
};

export const getDefinitionById = async (req: Request, res: Response) => {
    try {
        const def = await prisma.reportDefinition.findUnique({
            where: { id: req.params.id },
            include: { department: true }
        });
        if (!def) return res.status(404).json({ error: 'Not found' });
        res.json({
            ...def,
            structure: JSON.parse(def.structure),
            departmentName: def.department?.name
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch definition' });
    }
};

export const createDefinition = async (req: Request, res: Response) => {
    try {
        const { structure, departmentId, ...rest } = req.body;
        const def = await prisma.reportDefinition.create({
            data: {
                ...rest,
                departmentId: departmentId || null,
                structure: JSON.stringify(structure)
            }
        });
        res.json({ ...def, structure: JSON.parse(def.structure) });
    } catch (error: any) {
        console.error('Create definition error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Key already exists' });
        }
        res.status(500).json({ error: 'Failed to create definition' });
    }
};

export const updateDefinition = async (req: Request, res: Response) => {
    try {
        const { structure, departmentId, ...rest } = req.body;
        const updateData: any = { ...rest };
        if (structure) updateData.structure = JSON.stringify(structure);
        if (departmentId !== undefined) updateData.departmentId = departmentId || null;

        const def = await prisma.reportDefinition.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json({ ...def, structure: JSON.parse(def.structure) });
    } catch (error) {
        console.error('Update definition error:', error);
        res.status(500).json({ error: 'Failed to update definition' });
    }
};

export const deleteDefinition = async (req: Request, res: Response) => {
    try {
        await prisma.reportDefinition.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete definition error:', error);
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete definition with existing submissions' });
        }
        res.status(500).json({ error: 'Failed to delete definition' });
    }
};

// --- Submissions ---

export const getSubmissions = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        let where: any = {};

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId as string },
                include: { department: true }
            });

            if (user) {
                if (user.department?.code === 'GENERAL') {
                    // No filter
                } else if (user.role === 'DEPARTMENT_LEAD' || user.role === 'ADMIN') {
                    where.departmentId = user.departmentId;
                } else {
                    where.submittedBy = user.name;
                }
            }
        }

        const submissions = await prisma.reportSubmission.findMany({
            where,
            orderBy: { submittedAt: 'desc' }
        });
        const parsed = submissions.map(s => ({
            ...s,
            data: JSON.parse(s.data)
        }));
        res.json(parsed);
    } catch (error) {
        console.error('Fetch submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const getSubmissionById = async (req: Request, res: Response) => {
    try {
        const sub = await prisma.reportSubmission.findUnique({ where: { id: req.params.id } });
        if (!sub) return res.status(404).json({ error: 'Not found' });
        res.json({ ...sub, data: JSON.parse(sub.data) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};

export const createSubmission = async (req: Request, res: Response) => {
    try {
        const { data, ...rest } = req.body;
        const submission = await prisma.reportSubmission.create({
            data: {
                ...rest,
                data: JSON.stringify(data),
                submittedAt: new Date(),
                periodStart: new Date(rest.periodStart),
                periodEnd: new Date(rest.periodEnd)
            }
        });
        res.json({ ...submission, data: JSON.parse(submission.data) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create submission' });
    }
};

export const updateSubmission = async (req: Request, res: Response) => {
    try {
        const { data, ...rest } = req.body;
        const updateData: any = { ...rest };
        if (data) updateData.data = JSON.stringify(data);
        if (rest.periodStart) updateData.periodStart = new Date(rest.periodStart);
        if (rest.periodEnd) updateData.periodEnd = new Date(rest.periodEnd);

        const submission = await prisma.reportSubmission.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json({ ...submission, data: JSON.parse(submission.data) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update submission' });
    }
};
