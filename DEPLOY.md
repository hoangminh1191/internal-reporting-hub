# Hướng Dẫn Triển Khai Internal Reporting Hub

Ứng dụng này bao gồm Frontend (React/Vite) và Backend (Node.js/Express). Hướng dẫn này sẽ giúp bạn triển khai ứng dụng lên một máy chủ (ví dụ: VPS chạy Ubuntu, Windows Server, hoặc local machine).

## 1. Yêu Cầu Hệ Thống
- **Node.js**: Phiên bản 18 trở lên.
- **Cơ sở dữ liệu**: SQLite (mặc định) hoặc PostgreSQL/MySQL (cần cấu hình thêm).

## 2. Chuẩn Bị Mã Nguồn
Đảm bảo bạn đã tải toàn bộ mã nguồn về máy chủ.

## 3. Cài Đặt và Build

### Bước 1: Build Frontend
Di chuyển vào thư mục gốc của dự án và cài đặt dependencies cho frontend:

```bash
# Tại thư mục gốc (internal-reporting-hub)
npm install
npm run build
```

Sau khi chạy xong, bạn sẽ thấy thư mục `dist` được tạo ra tại thư mục gốc. Đây là phiên bản production của frontend.

### Bước 2: Build Backend
Di chuyển vào thư mục `server` và cài đặt dependencies cho backend:

```bash
cd server
npm install
npm run build
```

Lệnh này sẽ biên dịch mã TypeScript ra thư mục `server/dist`.

### Bước 3: Thiết Lập Cơ Sở Dữ Liệu
Chạy lệnh migrate để tạo bảng trong cơ sở dữ liệu:

```bash
# Tại thư mục server
npx prisma migrate deploy
npm run seed # (Tùy chọn) Chạy lệnh này nếu muốn tạo dữ liệu mẫu
```

## 4. Chạy Ứng Dụng

Để chạy ứng dụng ở chế độ production:

```bash
# Tại thư mục server
npm start
```

Máy chủ sẽ khởi động tại `http://localhost:3001` (hoặc port bạn cấu hình trong `.env`).
Backend đã được cấu hình để phục vụ cả API và Frontend. Bạn chỉ cần truy cập vào đường dẫn trên để sử dụng ứng dụng.

## 5. Chạy Nền (Background Service)
Để ứng dụng chạy liên tục ngay cả khi bạn đóng terminal, hãy sử dụng `pm2`:

```bash
npm install -g pm2
pm2 start dist/index.js --name "reporting-hub"
pm2 save
```

## 6. Biến Môi Trường (.env)
Đảm bảo file `server/.env` có các biến cần thiết:

```env
PORT=3001
DATABASE_URL="file:./dev.db" 
# JWT_SECRET=... (Nếu có sử dụng xác thực JWT bảo mật hơn)
```

## 7. Tự Động Hóa Triển Khai (GitHub Actions)

Dự án đã được tích hợp sẵn quy trình CD tại `.github/workflows/deploy.yml`. Quy trình này sẽ tự động cập nhật code lên server 2 phút sau khi bạn push code vào nhánh `main`.

### Cấu Hình Secrets
Để kích hoạt tính năng này, bạn cần vào tab **Settings > Secrets and variables > Actions** trên GitHub repository và thêm các secrets sau:

| Tên Secret | Mô tả |
|------------|-------|
| `SERVER_HOST` | Địa chỉ IP của máy chủ. |
| `SERVER_USER` | Tên đăng nhập SSH (ví dụ: `ubuntu`, `root`). |
| `SERVER_SSH_KEY` | Private SSH Key để truy cập server (nội dung file `.pem` hoặc `id_rsa`). |
| `SERVER_PATH` | Đường dẫn tuyệt đối đến thư mục dự án trên server (ví dụ: `/home/ubuntu/internal-reporting-hub`). |

### Quy Trình Hoạt Động
1. Bạn push code lên nhánh `main`.
2. Workflow "Deploy to Server" được kích hoạt.
3. Hệ thống đợi **2 phút** (theo yêu cầu).
4. Hệ thống SSH vào server và thực hiện chuỗi lệnh:
   - `git pull`
   - Build Frontend & Backend
   - Migrate Database
   - Restart PM2 service (`reporting-hub`)

