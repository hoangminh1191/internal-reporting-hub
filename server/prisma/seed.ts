import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Departments
    const departments = [
        { id: 'd1', name: 'Vận hành (Operations)', code: 'OPS' },
        { id: 'd2', name: 'Kỹ thuật (Engineering)', code: 'ENG' },
        { id: 'd3', name: 'Nhân sự (HR)', code: 'HR' },
        { id: 'd4', name: 'Phòng Tổng Hợp (General)', code: 'GENERAL' },
    ];

    for (const dept of departments) {
        await prisma.department.upsert({
            where: { id: dept.id },
            update: {},
            create: dept,
        });
    }

    // 2. Users
    const users = [
        {
            id: 'u1',
            name: 'Nguyễn Văn A',
            email: 'a.nguyen@company.com',
            role: 'DEPARTMENT_LEAD',
            departmentId: 'd1',
            password: '123456' // Mock password
        },
        {
            id: 'u2',
            name: 'Trần Thị B',
            email: 'b.tran@company.com',
            role: 'DEPARTMENT_LEAD',
            departmentId: 'd2',
            password: '123456'
        },
        {
            id: 'u3',
            name: 'Admin User',
            email: 'admin@company.com',
            role: 'ADMIN',
            departmentId: 'd3',
            password: '123456'
        },
        {
            id: 'u4',
            name: 'Lê Văn C',
            email: 'c.le@company.com',
            role: 'DEPARTMENT_USER',
            departmentId: 'd1',
            password: '123456'
        },
        {
            id: 'u5',
            name: 'Cán Bộ Tổng Hợp',
            email: 'general@company.com',
            role: 'DEPARTMENT_LEAD', // Giving them LEAD role to see reports, or could be USER if we rely on department code
            departmentId: 'd4',
            password: '123456'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password: user.password // Ensure password is updated if user exists
            },
            create: {
                ...user,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
            },
        });
    }

    // 3. Definitions
    const definitions = [
        {
            id: 'rd1',
            key: 'ops_monthly',
            name: 'Báo cáo Vận hành Tháng',
            description: 'Tổng hợp chỉ số vận hành máy móc và thời gian dừng máy.',
            periodType: 'monthly',
            status: 'active',
            structure: JSON.stringify([
                { id: 'machines_active', label: 'Số lượng máy hoạt động', type: 'number', required: true, unit: 'máy' },
                { id: 'total_output', label: 'Tổng sản lượng', type: 'number', required: true, unit: 'đơn vị' },
                { id: 'downtime_hours', label: 'Thời gian dừng máy', type: 'number', required: true, unit: 'giờ' },
                { id: 'incident_count', label: 'Số sự cố ghi nhận', type: 'number', required: false },
                { id: 'main_issue', label: 'Vấn đề chính gặp phải', type: 'text', required: false },
            ]),
        },
        {
            id: 'rd2',
            key: 'hr_weekly',
            name: 'Báo cáo Nhân sự Tuần',
            description: 'Biến động nhân sự hàng tuần.',
            periodType: 'weekly',
            status: 'active',
            structure: JSON.stringify([
                { id: 'new_hires', label: 'Tuyển mới', type: 'number', required: true },
                { id: 'resignations', label: 'Nghỉ việc', type: 'number', required: true },
                { id: 'department_mood', label: 'Đánh giá tinh thần', type: 'select', options: ['Tốt', 'Bình thường', 'Căng thẳng'], required: true },
            ]),
        },
    ];

    for (const def of definitions) {
        await prisma.reportDefinition.upsert({
            where: { key: def.key },
            update: {},
            create: def,
        });
    }

    // 4. Submissions (Seed a few sample submissions)
    // Need to recreate exact scenario needed
    const submissions = [
        {
            id: 's1',
            reportDefinitionId: 'rd1',
            departmentId: 'd1',
            submittedBy: 'Nguyễn Văn A',
            submittedAt: new Date('2023-10-05T10:00:00Z'),
            periodStart: new Date('2023-10-01'),
            periodEnd: new Date('2023-10-31'),
            data: JSON.stringify({ machines_active: 45, total_output: 12000, downtime_hours: 12, incident_count: 2, main_issue: 'Lỗi cảm biến băng chuyền' }),
            status: 'SUBMITTED',
            version: 1,
        }
    ];

    for (const sub of submissions) {
        await prisma.reportSubmission.upsert({
            where: { id: sub.id },
            update: {},
            create: sub,
        });
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
