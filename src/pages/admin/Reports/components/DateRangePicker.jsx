// src/pages/admin/Reports/components/DateRangePicker.js
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
    FiCalendar, 
    FiClock,
    FiCheck,
    FiChevronDown,
    FiRefreshCw,
    FiX
} from "react-icons/fi";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isSameDay, isAfter, isBefore, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import PropTypes from "prop-types";
import "./DateRangePicker.css";

// Constants
const DATE_FORMAT = "dd/MM/yyyy";
const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

// Helper function to safely format dates
const safeFormatDate = (date, formatStr, locale = vi) => {
    if (!date || !isValid(date)) return '';
    return format(date, formatStr, { locale });
};

// Get default date range (first day of current month to today)
const getDefaultDateRange = () => {
    const start = new Date();
    start.setDate(1);
    return { start, end: new Date() };
};

// Quick range definitions
const QUICK_RANGES = [
    { 
        id: "today", 
        label: "Hôm nay", 
        getRange: () => ({ start: new Date(), end: new Date() }),
        icon: FiClock
    },
    { 
        id: "yesterday", 
        label: "Hôm qua", 
        getRange: () => {
            const yesterday = subDays(new Date(), 1);
            return { start: yesterday, end: yesterday };
        },
        icon: FiClock
    },
    { 
        id: "last7days", 
        label: "7 ngày qua", 
        getRange: () => ({
            start: subDays(new Date(), 7),
            end: new Date()
        }),
        icon: FiClock
    },
    { 
        id: "last30days", 
        label: "30 ngày qua", 
        getRange: () => ({
            start: subDays(new Date(), 30),
            end: new Date()
        }),
        icon: FiClock
    },
    { 
        id: "thisMonth", 
        label: "Tháng này", 
        getRange: () => ({
            start: startOfMonth(new Date()),
            end: new Date()
        }),
        icon: FiClock
    },
    { 
        id: "lastMonth", 
        label: "Tháng trước", 
        getRange: () => {
            const date = subMonths(new Date(), 1);
            return {
                start: startOfMonth(date),
                end: endOfMonth(date)
            };
        },
        icon: FiClock
    },
    { 
        id: "thisQuarter", 
        label: "Quý này", 
        getRange: () => ({
            start: startOfQuarter(new Date()),
            end: new Date()
        }),
        icon: FiClock
    },
    { 
        id: "thisYear", 
        label: "Năm nay", 
        getRange: () => ({
            start: startOfYear(new Date()),
            end: new Date()
        }),
        icon: FiClock
    }
];

function DateRangePicker({ 
    startDate: propStartDate, 
    endDate: propEndDate, 
    onChange, 
    maxDate = new Date(),
    minDate = null,
    placeholder = "Chọn khoảng thời gian",
    className = "",
    disabled = false,
    clearable = true,
    showQuickRanges = true,
    showFooter = true,
    onApply,
    onClear,
    onRefresh,
    defaultStartDate = null,
    defaultEndDate = null
}) {
    // Internal state for dates
    const [startDate, setStartDate] = useState(() => {
        if (propStartDate && isValid(propStartDate)) return propStartDate;
        if (defaultStartDate && isValid(defaultStartDate)) return defaultStartDate;
        const { start } = getDefaultDateRange();
        return start;
    });
    
    const [endDate, setEndDate] = useState(() => {
        if (propEndDate && isValid(propEndDate)) return propEndDate;
        if (defaultEndDate && isValid(defaultEndDate)) return defaultEndDate;
        const { end } = getDefaultDateRange();
        return end;
    });
    
    // State for dropdown
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);
    const [activeQuickRange, setActiveQuickRange] = useState(null);
    
    // Refs
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    
    // Update internal state when props change
    useEffect(() => {
        if (propStartDate && isValid(propStartDate)) {
            setStartDate(propStartDate);
        }
    }, [propStartDate]);
    
    useEffect(() => {
        if (propEndDate && isValid(propEndDate)) {
            setEndDate(propEndDate);
        }
    }, [propEndDate]);
    
    // Memoized values
    const displayText = useMemo(() => {
        if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
            return placeholder;
        }
        if (isSameDay(startDate, endDate)) {
            return safeFormatDate(startDate, DISPLAY_DATE_FORMAT);
        }
        return `${safeFormatDate(startDate, DISPLAY_DATE_FORMAT)} - ${safeFormatDate(endDate, DISPLAY_DATE_FORMAT)}`;
    }, [startDate, endDate, placeholder]);
    
    // Handlers
    const handleToggle = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => !prev);
            if (!isOpen) {
                setTempStartDate(startDate);
                setTempEndDate(endDate);
                setActiveQuickRange(null);
            }
        }
    }, [disabled, isOpen, startDate, endDate]);
    
    // Close handler - reset to default dates and reload
    const handleClose = useCallback((e) => {
        if (e) {
            e.stopPropagation();
        }
        setIsOpen(false);
        
        // Reset về ngày mặc định (đầu tháng đến hiện tại)
        const { start: defaultStart, end: defaultEnd } = getDefaultDateRange();
        
        setTempStartDate(defaultStart);
        setTempEndDate(defaultEnd);
        setStartDate(defaultStart);
        setEndDate(defaultEnd);
        setActiveQuickRange(null);
        
        // Gọi onChange với default dates để update bộ lọc
        if (onChange) {
            onChange(defaultStart, defaultEnd);
        }
        
        // Gọi onRefresh để reload dữ liệu với bộ lọc mới
        if (onRefresh) {
            onRefresh();
        }
    }, [onChange, onRefresh]);
    
    // Clear handler - reset to default dates and reload
    const handleClear = useCallback((e) => {
        if (e) {
            e.stopPropagation();
        }
        
        // Reset về ngày mặc định (đầu tháng đến hiện tại)
        const { start: defaultStart, end: defaultEnd } = getDefaultDateRange();
        
        setTempStartDate(defaultStart);
        setTempEndDate(defaultEnd);
        setStartDate(defaultStart);
        setEndDate(defaultEnd);
        setActiveQuickRange(null);
        
        // Gọi onChange với default dates để update bộ lọc
        if (onChange) {
            onChange(defaultStart, defaultEnd);
        }
        
        // Gọi onClear nếu có
        if (onClear) {
            onClear();
        }
        
        // Gọi onRefresh để reload dữ liệu với bộ lọc mới
        if (onRefresh) {
            onRefresh();
        }
        
        setIsOpen(false);
    }, [onChange, onClear, onRefresh]);
    
    const handleQuickRange = useCallback((range) => {
        const { start, end } = range.getRange();
        const validStart = minDate && isBefore(start, minDate) ? minDate : start;
        const validEnd = maxDate && isAfter(end, maxDate) ? maxDate : end;
        
        setTempStartDate(validStart);
        setTempEndDate(validEnd);
        setActiveQuickRange(range.id);
    }, [minDate, maxDate]);
    
    const handleApply = useCallback(() => {
        if (tempStartDate && tempEndDate && isValid(tempStartDate) && isValid(tempEndDate)) {
            let finalStart = tempStartDate;
            let finalEnd = tempEndDate;
            
            if (isAfter(tempStartDate, tempEndDate)) {
                finalStart = tempEndDate;
                finalEnd = tempStartDate;
            }
            
            setStartDate(finalStart);
            setEndDate(finalEnd);
            
            if (onChange) {
                onChange(finalStart, finalEnd);
            }
            
            if (onApply) {
                onApply(finalStart, finalEnd);
            }
        }
        setIsOpen(false);
    }, [tempStartDate, tempEndDate, onChange, onApply]);
    
    const handleDateChange = useCallback((date, type) => {
        if (type === 'start') {
            setTempStartDate(date);
            if (date && tempEndDate && isValid(date) && isValid(tempEndDate) && isAfter(date, tempEndDate)) {
                setTempEndDate(date);
            }
        } else {
            setTempEndDate(date);
            if (date && tempStartDate && isValid(date) && isValid(tempStartDate) && isBefore(date, tempStartDate)) {
                setTempStartDate(date);
            }
        }
        setActiveQuickRange(null);
    }, [tempStartDate, tempEndDate]);
    
    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                const target = event.target;
                if (target.closest && !target.closest('.clear-btn') && !target.closest('.cancel-btn')) {
                    setIsOpen(false);
                    setTempStartDate(startDate);
                    setTempEndDate(endDate);
                }
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [startDate, endDate]);
    
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isOpen) {
                handleClose(event);
            }
            if (event.key === "Enter" && isOpen) {
                handleApply();
            }
        };
        
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose, handleApply]);
    
    // Determine if quick range is active
    const isQuickRangeActive = useCallback((rangeId) => {
        if (!activeQuickRange) return false;
        return activeQuickRange === rangeId;
    }, [activeQuickRange]);
    
    return (
        <div className={`date-range-picker-wrapper ${className}`}>
            {/* Input trigger */}
            <div 
                ref={inputRef}
                className={`date-range-picker-input ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={handleToggle}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label="Chọn khoảng thời gian"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className="input-content">
                    <FiCalendar className="calendar-icon" />
                    <span className="date-text">{displayText}</span>
                </div>
                <div className="input-actions">
                    {clearable && startDate && endDate && isValid(startDate) && isValid(endDate) && (
                        <button
                            className="clear-btn"
                            onClick={handleClear}
                            aria-label="Xóa bộ lọc và reload"
                            type="button"
                            title="Xóa bộ lọc và tải lại dữ liệu"
                        >
                            <FiRefreshCw />
                        </button>
                    )}
                    <FiChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} />
                </div>
            </div>
            
            {/* Dropdown */}
            {isOpen && !disabled && (
                <div 
                    ref={dropdownRef}
                    className="date-range-picker-dropdown"
                    role="dialog"
                    aria-label="Chọn khoảng thời gian"
                >
                    <div className="dropdown-content">
                        {/* Quick ranges */}
                        {showQuickRanges && (
                            <div className="quick-ranges-section">
                                <h4 className="section-title">
                                    <FiClock className="section-icon" />
                                    Chọn nhanh
                                </h4>
                                <div className="quick-ranges-grid">
                                    {QUICK_RANGES.map((range) => {
                                        const Icon = range.icon;
                                        const isActive = isQuickRangeActive(range.id);
                                        return (
                                            <button
                                                key={range.id}
                                                className={`quick-range-btn ${isActive ? 'active' : ''}`}
                                                onClick={() => handleQuickRange(range)}
                                                type="button"
                                            >
                                                <Icon className="btn-icon" />
                                                <span>{range.label}</span>
                                                {isActive && <FiCheck className="check-icon" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* Custom range */}
                        <div className="custom-range-section">
                            <h4 className="section-title">Tùy chỉnh</h4>
                            <div className="custom-range-content">
                                <div className="date-picker-group">
                                    <div className="date-picker-item">
                                        <label className="date-label">Từ ngày</label>
                                        <DatePicker
                                            selected={tempStartDate}
                                            onChange={(date) => handleDateChange(date, 'start')}
                                            selectsStart
                                            startDate={tempStartDate}
                                            endDate={tempEndDate}
                                            minDate={minDate}
                                            maxDate={maxDate}
                                            dateFormat={DATE_FORMAT}
                                            className="custom-date-picker"
                                            placeholderText="DD/MM/YYYY"
                                            locale={vi}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            isClearable={false}
                                            disabledKeyboardNavigation
                                        />
                                    </div>
                                    <div className="date-picker-item">
                                        <label className="date-label">Đến ngày</label>
                                        <DatePicker
                                            selected={tempEndDate}
                                            onChange={(date) => handleDateChange(date, 'end')}
                                            selectsEnd
                                            startDate={tempStartDate}
                                            endDate={tempEndDate}
                                            minDate={tempStartDate || minDate}
                                            maxDate={maxDate}
                                            dateFormat={DATE_FORMAT}
                                            className="custom-date-picker"
                                            placeholderText="DD/MM/YYYY"
                                            locale={vi}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            isClearable={false}
                                            disabledKeyboardNavigation
                                        />
                                    </div>
                                </div>
                                
                                {/* Selected range info */}
                                {tempStartDate && tempEndDate && isValid(tempStartDate) && isValid(tempEndDate) && (
                                    <div className="selected-range-info">
                                        <span className="range-days">
                                            Khoảng {Math.ceil((tempEndDate - tempStartDate) / (1000 * 60 * 60 * 24)) + 1} ngày
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Footer actions */}
                        {showFooter && (
                            <div className="dropdown-footer">
                                {/* <button
                                    className="footer-btn cancel-btn"
                                    onClick={handleClose}
                                    type="button"
                                    title="Xóa bộ lọc và tải lại dữ liệu"
                                >
                                    <FiX className="btn-icon" />
                                    Xóa bộ lọc
                                </button> */}
                                <button
                                    className="footer-btn apply-btn"
                                    onClick={handleApply}
                                    type="button"
                                    disabled={!tempStartDate || !tempEndDate || !isValid(tempStartDate) || !isValid(tempEndDate)}
                                >
                                    Áp dụng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// PropTypes
DateRangePicker.propTypes = {
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    onChange: PropTypes.func.isRequired,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    placeholder: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    clearable: PropTypes.bool,
    showQuickRanges: PropTypes.bool,
    showFooter: PropTypes.bool,
    onApply: PropTypes.func,
    onClear: PropTypes.func,
    onRefresh: PropTypes.func,
    defaultStartDate: PropTypes.instanceOf(Date),
    defaultEndDate: PropTypes.instanceOf(Date)
};

DateRangePicker.defaultProps = {
    maxDate: new Date(),
    minDate: null,
    placeholder: "Chọn khoảng thời gian",
    className: "",
    disabled: false,
    clearable: true,
    showQuickRanges: true,
    showFooter: true,
    onApply: null,
    onClear: null,
    onRefresh: null,
    defaultStartDate: null,
    defaultEndDate: null
};

export default DateRangePicker;