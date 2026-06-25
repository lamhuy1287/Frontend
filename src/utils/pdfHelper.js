// src/utils/pdfHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Font tiếng Việt cho jsPDF (sử dụng font có sẵn)
export const createPDFWithVietnamese = () => {
    // Sử dụng font tiêu chuẩn (không hỗ trợ tiếng Việt có dấu)
    // Để hỗ trợ tiếng Việt, cần sử dụng font tùy chỉnh
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Thêm metadata
    doc.setProperties({
        title: 'Báo cáo',
        subject: 'Báo cáo thống kê',
        author: 'Admin',
        creator: 'System'
    });
    
    return doc;
};

// Hàm vẽ header cho PDF
export const addPDFHeader = (doc, title, dateRange) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(
        `Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`,
        pageWidth / 2,
        30,
        { align: 'center' }
    );
    
    return 30; // Return final Y position
};

// Hàm thêm footer cho PDF
export const addPDFFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Trang ${i}/${pageCount} - Xuất ngày ${new Date().toLocaleString("vi-VN")}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }
};

// Hàm tạo bảng với hỗ trợ tiếng Việt
export const createTable = (doc, data, headers, startY, title = '') => {
    if (!data || data.length === 0) return startY;
    
    // Sử dụng autoTable với font mặc định
    // Lưu ý: Font mặc định không hỗ trợ tiếng Việt có dấu
    // Để hiển thị đúng, cần nhúng font hoặc sử dụng font có hỗ trợ Unicode
    
    autoTable(doc, {
        startY: startY,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { 
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 8,
            textColor: [15, 23, 42],
            cellPadding: 3,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
    });
    
    return doc.lastAutoTable.finalY + 10;
};

// Hàm kiểm tra text có dấu tiếng Việt
export const hasVietnameseAccent = (text) => {
    const vietnameseAccent = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseAccent.test(text);
};

// Gợi ý: Để hỗ trợ đầy đủ tiếng Việt, bạn nên sử dụng font có hỗ trợ Unicode
// Có thể sử dụng font DejaVu hoặc Arial Unicode