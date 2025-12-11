
import { ReportDefinition, ReportSubmission, ReportStatus, User, UserRole, Department } from '../types';

// SEED DATA: Chỉ dùng để khởi tạo Database lần đầu tiên

export const SEED_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Vận hành (Operations)', code: 'OPS' },
  { id: 'd2', name: 'Kỹ thuật (Engineering)', code: 'ENG' },
  { id: 'd3', name: 'Nhân sự (HR)', code: 'HR' },
];

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    email: 'a.nguyen@company.com',
    role: UserRole.DEPARTMENT_LEAD, 
    departmentId: 'd1',
    avatarUrl: 'https://picsum.photos/seed/u1/200',
  },
  {
    id: 'u2',
    name: 'Trần Thị B',
    email: 'b.tran@company.com',
    role: UserRole.DEPARTMENT_LEAD,
    departmentId: 'd2',
    avatarUrl: 'https://picsum.photos/seed/u2/200',
  },
  {
    id: 'u3',
    name: 'Admin User',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    departmentId: 'd3',
    avatarUrl: 'https://picsum.photos/seed/u3/200',
  },
  {
    id: 'u4',
    name: 'Lê Văn C',
    email: 'c.le@company.com',
    role: UserRole.DEPARTMENT_USER,
    departmentId: 'd1',
    avatarUrl: 'https://picsum.photos/seed/u4/200',
  }
];

export const SEED_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'rd1',
    key: 'ops_monthly',
    name: 'Báo cáo Vận hành Tháng',
    description: 'Tổng hợp chỉ số vận hành máy móc và thời gian dừng máy.',
    periodType: 'monthly',
    status: 'active',
    structure: [
      { id: 'machines_active', label: 'Số lượng máy hoạt động', type: 'number', required: true, unit: 'máy' },
      { id: 'total_output', label: 'Tổng sản lượng', type: 'number', required: true, unit: 'đơn vị' },
      { id: 'downtime_hours', label: 'Thời gian dừng máy', type: 'number', required: true, unit: 'giờ' },
      { id: 'incident_count', label: 'Số sự cố ghi nhận', type: 'number', required: false },
      { id: 'main_issue', label: 'Vấn đề chính gặp phải', type: 'text', required: false },
    ],
  },
  {
    id: 'rd2',
    key: 'hr_weekly',
    name: 'Báo cáo Nhân sự Tuần',
    description: 'Biến động nhân sự hàng tuần.',
    periodType: 'weekly',
    status: 'active',
    structure: [
      { id: 'new_hires', label: 'Tuyển mới', type: 'number', required: true },
      { id: 'resignations', label: 'Nghỉ việc', type: 'number', required: true },
      { id: 'department_mood', label: 'Đánh giá tinh thần', type: 'select', options: ['Tốt', 'Bình thường', 'Căng thẳng'], required: true },
    ],
  },
];

export const SEED_SUBMISSIONS: ReportSubmission[] = [
  {
    id: 's1',
    reportDefinitionId: 'rd1',
    departmentId: 'd1',
    departmentName: 'Vận hành (Operations)',
    submittedBy: 'Nguyễn Văn A',
    submittedAt: '2023-10-05T10:00:00Z',
    periodStart: '2023-10-01',
    periodEnd: '2023-10-31',
    data: { machines_active: 45, total_output: 12000, downtime_hours: 12, incident_count: 2, main_issue: 'Lỗi cảm biến băng chuyền' },
    status: ReportStatus.SUBMITTED,
    version: 1,
  },
  {
    id: 's2',
    reportDefinitionId: 'rd1',
    departmentId: 'd2',
    departmentName: 'Kỹ thuật (Engineering)',
    submittedBy: 'Trần Thị B',
    submittedAt: '2023-10-06T09:30:00Z',
    periodStart: '2023-10-01',
    periodEnd: '2023-10-31',
    data: { machines_active: 20, total_output: 5000, downtime_hours: 4 },
    status: ReportStatus.APPROVED,
    version: 1,
  },
  {
    id: 's3',
    reportDefinitionId: 'rd2',
    departmentId: 'd1',
    departmentName: 'Vận hành (Operations)',
    submittedBy: 'Nguyễn Văn A',
    periodStart: '2023-11-01',
    periodEnd: '2023-11-07',
    data: {},
    status: ReportStatus.DRAFT,
    version: 1,
  },
];
