
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { department: true }
        });
        if (!user) return res.status(404).json({ error: 'Not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, role, departmentId, password, avatarUrl } = req.body;
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                departmentId,
                password: password || '123456', // Default password if missing
                avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
            }
        });
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        console.error('Create user error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, email, role, departmentId, password, avatarUrl } = req.body;
        const updateData: any = { name, email, role, departmentId, avatarUrl };
        if (password) updateData.password = password;

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData
        });
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        console.error('Update user error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
