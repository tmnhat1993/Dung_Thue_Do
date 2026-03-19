// ============================================================
//  COSPLAY RENTAL MANAGER — Google Apps Script
//  Dán toàn bộ code này vào Google Apps Script Editor
//  File > Save > Deploy > New Deployment > Web App
// ============================================================

// ⚠️ THAY GIÁ TRỊ NÀY THÀNH ID CỦA GOOGLE SHEET CỦA BẠN
const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";

// Tên sheet chứa data thuê đồ (tab ở dưới cùng của Google Sheet)
const SHEET_NAME = "THÔNG TIN";

// ============================================================
//  GET — Xử lý request GET (tra cứu lịch)
// ============================================================
function doGet(e) {
  const action = e.parameter.action || "";

  if (action === "getSchedule") {
    return handleGetSchedule(e);
  }

  // Mặc định: trả về thông tin kiểm tra kết nối
  return jsonResponse({
    status: "ok",
    message: "Cosplay Rental API đang hoạt động ✅",
  });
}

// ============================================================
//  POST — Xử lý request POST (nhập liệu)
// ============================================================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const rows = payload.rows;

    if (!rows || !Array.isArray(rows)) {
      return jsonResponse({ status: "error", message: "Dữ liệu không hợp lệ" });
    }

    const sheet = getSheet();
    const inserted = [];

    rows.forEach((row) => {
      const newRow = [
        row.colA || "",              // Cột A: Tên khách
        "",                          // Cột B: (để trống)
        "",                          // Cột C: (để trống)
        row.colD || "0",             // Cột D: Cọc
        parseDateToObj(row.colE),    // Cột E: Ngày thuê — lưu dạng Date object
        row.colF || "",              // Cột F: Tên đồ
        row.colG || "",              // Cột G: Ghi chú
      ];
      sheet.appendRow(newRow);
      inserted.push(newRow);
    });

    return jsonResponse({
      status: "success",
      inserted: inserted.length,
      message: `Đã thêm ${inserted.length} dòng thành công`,
    });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// ============================================================
//  Lấy lịch theo khoảng ngày
// ============================================================
function handleGetSchedule(e) {
  try {
    const fromStr = e.parameter.from || ""; // dd/mm/yyyy
    const toStr = e.parameter.to || ""; // dd/mm/yyyy

    if (!fromStr || !toStr) {
      return jsonResponse({
        status: "error",
        message: "Thiếu tham số from/to",
      });
    }

    const fromDate = parseSheetDate(fromStr);
    const toDate = parseSheetDate(toStr);

    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    // Hàng 1 là header, bỏ qua
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const dateVal = row[4]; // Cột E (index 4)
      if (!dateVal) continue;

      // Cột E có thể là Date object hoặc string dd/mm/yyyy
      let rowDate;
      if (dateVal instanceof Date) {
        rowDate = dateVal;
      } else {
        rowDate = parseSheetDate(String(dateVal));
      }

      if (!rowDate) continue;
      if (rowDate >= fromDate && rowDate <= toDate) {
        rows.push({
          colA: row[0] || "",
          colD: row[3] || "",
          colE: formatDateForUI(rowDate),
          colF: row[5] || "",
          colG: row[6] || "",
        });
      }
    }

    // Sort theo ngày
    rows.sort((a, b) => {
      return parseSheetDate(a.colE) - parseSheetDate(b.colE);
    });

    return jsonResponse({ status: "success", rows });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// ============================================================
//  HELPERS
// ============================================================

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Tự tạo sheet nếu chưa có
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Tên khách",
      "",
      "",
      "Cọc",
      "Ngày thuê",
      "Tên đồ",
      "Ghi chú",
    ]);
  }
  return sheet;
}

/**
 * Parse "dd/mm/yyyy" string → Date object để lưu vào Google Sheets
 * Tránh lỗi JS tự parse "dd/mm/yyyy" thành mm/dd
 */
function parseDateToObj(str) {
  if (!str) return '';
  const parts = String(str).trim().split('/');
  if (parts.length < 3) return str;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? str : dt;
}

/**
 * Parse "dd/mm/yyyy" → Date object (dùng cho so sánh ngày)
 */
function parseSheetDate(str) {
  if (!str) return null;
  str = String(str).trim();
  const parts = str.split("/");
  if (parts.length < 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
}

/**
 * Format Date → "dd/mm/yyyy" for front-end display
 */
function formatDateForUI(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Trả về JSON response với CORS headers
 */
function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
