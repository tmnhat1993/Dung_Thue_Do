# 📋 Hướng dẫn cài đặt — Cosplay Rental Manager

Web nhập liệu & tra cứu lịch thuê đồ cosplay, kết nối với Google Sheet.

---

## Tổng quan các file

| File | Mô tả |
|---|---|
| `index.html` | Web app chính (mở trực tiếp trên trình duyệt) |
| `Code.gs` | Script chạy trên Google Apps Script (backend) |
| `HUONG_DAN.md` | File này |

---

## BƯỚC 1 — Chuẩn bị Google Sheet

1. Vào **[Google Sheets](https://sheets.google.com)** → Tạo một Spreadsheet mới
2. Đặt tên sheet (tab ở dưới) là **`Thuê đồ`** (đúng chính xác tên này)
3. Tạo **hàng tiêu đề** ở dòng 1 như sau:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Tên khách | _(để trống)_ | _(để trống)_ | Cọc | Ngày thuê | Tên đồ | Ghi chú |

4. Copy **ID của Sheet** từ URL trình duyệt:
   ```
   https://docs.google.com/spreadsheets/d/  ← SAU ĐÂY LÀ SHEET_ID →  /edit
   ```
   Ví dụ: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`

---

## BƯỚC 2 — Cài đặt Google Apps Script

1. Trong Google Sheet, vào menu **Extensions → Apps Script**
2. Xoá toàn bộ code mặc định trong file `Code.gs`
3. **Dán toàn bộ nội dung file `Code.gs`** vào đó
4. Tìm dòng này và **thay SHEET_ID** bằng ID bạn vừa copy:
   ```javascript
   const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
   // → Thay thành:
   const SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
   ```
5. Nhấn **💾 Save** (Ctrl+S)

---

## BƯỚC 3 — Deploy Web App

1. Nhấn nút **Deploy** (góc trên phải) → chọn **New deployment**
2. Nhấn biểu tượng ⚙️ bên cạnh "Select type" → chọn **Web app**
3. Cấu hình như sau:

| Trường | Giá trị |
|---|---|
| Description | `Cosplay Rental API` (tuỳ ý) |
| Execute as | **Me** (tài khoản Google của bạn) |
| Who has access | **Anyone** ← **Quan trọng!** |

4. Nhấn **Deploy**
5. Google sẽ yêu cầu **Authorize access** → Nhấn **Authorize** → Chọn tài khoản Google → Nhấn **Allow**
6. Sau khi deploy xong, copy **Web app URL** hiện ra:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

> ⚠️ **Lưu ý quan trọng:** Mỗi lần bạn **chỉnh sửa code** trong Apps Script, bạn phải **Deploy lại** (New deployment hoặc Deploy → Manage deployments → Update) thì thay đổi mới có hiệu lực.

---

## BƯỚC 4 — Kết nối Web App với Google Sheet

1. Mở file **`index.html`** trên trình duyệt (click đúp vào file, hoặc dùng local server)
2. Ở ô **Google Sheet Web App URL** (thanh màu tối phía trên), dán URL bạn vừa copy vào
3. URL sẽ được lưu tự động vào localStorage của trình duyệt

### Kiểm tra kết nối

Mở URL trực tiếp trên trình duyệt:
```
https://script.google.com/macros/s/XXXXX/exec
```
Nếu trả về:
```json
{"status":"ok","message":"Cosplay Rental API đang hoạt động ✅"}
```
→ Kết nối thành công!

---

## Cách dùng Tab Nhập liệu

### Format dữ liệu nhập

```
Tên khách - Ngày thuê
Tên đồ (có thể nhiều dòng)
Cọc [số tiền]
Ghi chú (tuỳ chọn)
```

### Ví dụ:

```
Dung - 5/4
Miku ori - Không giày
Cọc 100
Khách tới lấy đồ
```

### Các bước:

1. Dán data vào **ô Slot #1**
2. Bấm **"+ Thêm slot"** để thêm ô mới nếu có nhiều đơn
3. Xem preview nhỏ bên dưới mỗi ô để kiểm tra data
4. Bấm **"🚀 Gửi lên Google Sheet"** để import tất cả

---

## Cách dùng Tab Lịch slot

1. Chọn ngày bất kỳ trong tuần muốn xem
2. Bấm **"🔄 Tải lịch"**
3. Web sẽ hiển thị lịch từ **Thứ 2 → Chủ nhật** của tuần đó
   - Nếu ngày chọn là **Thứ 7 hoặc Chủ nhật**: lịch hiển thị từ Thứ 2 tuần đó → Thứ 4 tuần sau
4. Bấm **"📷 Xuất ảnh JPG"** để lưu lịch thành file ảnh

---

## Xử lý lỗi thường gặp

### Lỗi "Failed to fetch" hoặc không gửi được
- Kiểm tra lại URL Web App đã đúng chưa
- Đảm bảo đã chọn **"Anyone"** khi deploy
- Thử deploy lại một lần nữa

### Lỗi "The caller does not have permission"
- Bạn chưa **Authorize** ứng dụng
- Vào Apps Script → Deploy → Manage deployments → chọn deployment → **Authorize**

### Sheet không tự tạo
- Kiểm tra SHEET_ID có đúng không
- Kiểm tra tên sheet tab phải là **`Thuê đồ`** (có dấu)
- Script có quyền edit sheet đó không (phải là owner hoặc được share với tài khoản deploy)

### Data ngày bị sai
- Format ngày nhập là `d/m` hoặc `d/m/yyyy`
- Năm sẽ tự động lấy năm hiện tại nếu không nhập

---

## Cấu trúc cột trong Google Sheet

| Cột | Tên | Mô tả |
|-----|-----|-------|
| A | Tên khách | Tên người thuê đồ |
| B | _(trống)_ | Dự phòng |
| C | _(trống)_ | Dự phòng |
| D | Cọc | Số tiền đặt cọc (số nguyên) |
| E | Ngày thuê | Format `dd/mm/yyyy` |
| F | Tên đồ | Tên bộ đồ cosplay |
| G | Ghi chú | Ghi chú thêm |

---

## Lưu ý bảo mật

- Web App URL **không nên chia sẻ công khai** vì ai có URL cũng có thể ghi dữ liệu vào Sheet
- Dùng cho nội bộ shop, không publish rộng rãi
- Nếu muốn bảo mật hơn: đổi **Who has access** thành **Anyone with Google Account** và yêu cầu đăng nhập

---

*Tạo bởi Claude · Liên hệ shop để được hỗ trợ*
