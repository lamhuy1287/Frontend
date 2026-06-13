// src/pages/admin/Reports/components/ExportButtons.js
import { FiDownload, FiFileText, FiFile, FiMail } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

function ExportButtons({ revenueData, orderData, customerData, productData, couponData, dateRange }) {
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(value || 0);
    };
    
    const formatDate = (date) => {
        return date.toLocaleDateString("vi-VN");
    };
    
    const exportToExcel = (data, filename, sheetName) => {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, `${filename}_${formatDate(new Date())}.xlsx`);
            toast.success(`Xuất ${filename} thành công!`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Xuất file thất bại");
        }
    };
    
    const exportToCSV = (data, filename) => {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `${filename}_${formatDate(new Date())}.csv`);
            toast.success(`Xuất ${filename} thành công!`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Xuất file thất bại");
        }
    };
    
    const handleExportRevenue = () => {
        if (!revenueData?.daily_revenue) {
            toast.error("Không có dữ liệu doanh thu để xuất");
            return;
        }
        exportToExcel(revenueData.daily_revenue, "bao_cao_doanh_thu", "Doanh thu");
    };
    
    const handleExportOrders = () => {
        if (!orderData?.orders_by_status) {
            toast.error("Không có dữ liệu đơn hàng để xuất");
            return;
        }
        exportToExcel(orderData.orders_by_status, "bao_cao_don_hang", "Đơn hàng");
    };
    
    const handleExportCustomers = () => {
        if (!customerData?.customer_segments) {
            toast.error("Không có dữ liệu khách hàng để xuất");
            return;
        }
        exportToExcel(customerData.customer_segments, "bao_cao_khach_hang", "Khách hàng");
    };
    
    const handleExportProducts = () => {
        if (!productData?.top_products) {
            toast.error("Không có dữ liệu sản phẩm để xuất");
            return;
        }
        exportToExcel(productData.top_products, "bao_cao_san_pham", "Sản phẩm");
    };
    
    const handleExportAll = () => {
        const allData = {
            revenue: revenueData?.daily_revenue || [],
            orders: orderData?.orders_by_status || [],
            customers: customerData?.customer_segments || [],
            products: productData?.top_products || [],
            coupons: couponData?.top_coupons || []
        };
        
        const exportData = [];
        
        // Thêm dữ liệu doanh thu
        if (allData.revenue.length) {
            allData.revenue.forEach(item => {
                exportData.push({
                    Loại: "Doanh thu",
                    Ngày: item.date,
                    "Doanh thu": formatCurrency(item.revenue)
                });
            });
        }
        
        // Thêm dữ liệu đơn hàng
        if (allData.orders.length) {
            allData.orders.forEach(item => {
                exportData.push({
                    Loại: "Đơn hàng",
                    "Trạng thái": item.status,
                    "Số lượng": item.count,
                    "Tỷ lệ": `${item.percent}%`,
                    "Doanh thu": formatCurrency(item.revenue)
                });
            });
        }
        
        exportToExcel(exportData, "bao_cao_tong_hop", "Tổng hợp");
    };
    
    return (
        <div className="export-section">
            <div className="export-header">
                <FiDownload className="export-icon" />
                <h3>Xuất báo cáo</h3>
            </div>
            <div className="export-buttons">
                <button className="export-btn excel" onClick={handleExportRevenue}>
                    <FiFile />
                    Doanh thu
                </button>
                <button className="export-btn excel" onClick={handleExportOrders}>
                    <FiFile />
                    Đơn hàng
                </button>
                <button className="export-btn excel" onClick={handleExportCustomers}>
                    <FiFile />
                    Khách hàng
                </button>
                <button className="export-btn excel" onClick={handleExportProducts}>
                    <FiFile />
                    Sản phẩm
                </button>
                <button className="export-btn primary" onClick={handleExportAll}>
                    <FiFileText />
                    Tất cả
                </button>
            </div>
        </div>
    );
}

export default ExportButtons;