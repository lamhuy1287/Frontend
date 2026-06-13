// src/pages/admin/Reports/components/DateRangePicker.js
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function DateRangePicker({ startDate, endDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const quickRanges = [
        { label: "Hôm nay", getValue: () => ({ start: new Date(), end: new Date() }) },
        { label: "Hôm qua", getValue: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return { start: yesterday, end: yesterday };
        }},
        { label: "7 ngày qua", getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7);
            return { start, end };
        }},
        { label: "30 ngày qua", getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            return { start, end };
        }},
        { label: "Tháng này", getValue: () => {
            const start = new Date();
            start.setDate(1);
            const end = new Date();
            return { start, end };
        }},
        { label: "Tháng trước", getValue: () => {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            const end = new Date();
            end.setDate(0);
            return { start, end };
        }},
        { label: "Quý này", getValue: () => {
            const now = new Date();
            const quarter = Math.floor(now.getMonth() / 3);
            const start = new Date(now.getFullYear(), quarter * 3, 1);
            const end = new Date();
            return { start, end };
        }},
        { label: "Năm nay", getValue: () => {
            const start = new Date(new Date().getFullYear(), 0, 1);
            const end = new Date();
            return { start, end };
        }}
    ];
    
    const handleQuickRange = (range) => {
        const { start, end } = range.getValue();
        onChange(start, end);
        setIsOpen(false);
    };
    
    return (
        <div className="date-range-picker">
            <div className="picker-input" onClick={() => setIsOpen(!isOpen)}>
                <FiCalendar />
                <span>
                    {startDate.toLocaleDateString("vi-VN")} - {endDate.toLocaleDateString("vi-VN")}
                </span>
            </div>
            
            {isOpen && (
                <div className="picker-dropdown">
                    <div className="quick-ranges">
                        <h4>Chọn nhanh</h4>
                        {quickRanges.map((range, idx) => (
                            <button
                                key={idx}
                                className="quick-range-btn"
                                onClick={() => handleQuickRange(range)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <div className="custom-range">
                        <h4>Tùy chỉnh</h4>
                        <div className="date-pickers">
                            <div>
                                <label>Từ ngày</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => onChange(date, endDate)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                            <div>
                                <label>Đến ngày</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => onChange(startDate, date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                        </div>
                        <button
                            className="apply-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DateRangePicker;