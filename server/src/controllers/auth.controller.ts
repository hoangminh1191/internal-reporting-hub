
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const cleanEmail = email.trim(); // Sanitize input
    try {
        const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
            include: { department: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Email không tồn tại' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }

        // Return user info (no token implementation for simplicity as per requirements)
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
