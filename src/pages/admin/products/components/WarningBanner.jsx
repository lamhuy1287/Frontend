import React, { useState } from 'react';

const WarningBanner = ({ 
    stockSummary, 
    showWarning, 
    onFilterChange,
    onClose,
    activeFilter = 'all'
}) => {
    // Nếu không có cảnh báo nào thì không hiển thị
    if (!showWarning.low_stock && 
        !showWarning.out_of_stock && 
        !showWarning.has_low_stock_variant && 
        !showWarning.has_out_of_stock_variant) {
        return null;
    }

    // Cấu hình các loại cảnh báo - Màu sắc nhẹ nhàng
    const warningConfigs = [
        {
            key: 'low_stock',
            icon: '📦',
            title: 'Sắp hết hàng',
            description: 'Tổng số lượng ≤ 5',
            bgColor: '#fefce8',
            borderColor: '#eab308',
            textColor: '#854d0e',
            filterValue: 'low_stock',
            count: stockSummary.low_stock,
            show: stockSummary.low_stock > 0,
            iconBg: '#fef9c3'
        },
        {
            key: 'out_of_stock',
            icon: '📭',
            title: 'Hết hàng',
            description: 'Tổng số lượng = 0',
            bgColor: '#fef2f2',
            borderColor: '#ef4444',
            textColor: '#991b1b',
            filterValue: 'out_of_stock',
            count: stockSummary.out_of_stock,
            show: stockSummary.out_of_stock > 0,
            iconBg: '#fee2e2'
        },
        {
            key: 'has_low_stock_variant',
            icon: '🔸',
            title: 'Biến thể sắp hết',
            description: 'Có biến thể ≤ 5',
            bgColor: '#fefce8',
            borderColor: '#eab308',
            textColor: '#854d0e',
            filterValue: 'has_low_stock_variant',
            count: stockSummary.has_low_stock_variant,
            show: stockSummary.has_low_stock_variant > 0,
            iconBg: '#fef9c3'
        },
        {
            key: 'has_out_of_stock_variant',
            icon: '🔹',
            title: 'Biến thể hết hàng',
            description: 'Có biến thể = 0',
            bgColor: '#fef2f2',
            borderColor: '#ef4444',
            textColor: '#991b1b',
            filterValue: 'has_out_of_stock_variant',
            count: stockSummary.has_out_of_stock_variant,
            show: stockSummary.has_out_of_stock_variant > 0,
            iconBg: '#fee2e2'
        }
    ];

    const activeWarnings = warningConfigs.filter(w => w.show);
    const totalWarnings = activeWarnings.length;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.headerIcon}>📊</span>
                    <span style={styles.headerTitle}>Tổng quan tồn kho</span>
                    {totalWarnings > 0 && (
                        <span style={styles.headerBadge}>{totalWarnings}</span>
                    )}
                </div>
                <div style={styles.headerRight}>
                    {totalWarnings > 1 && (
                        <button 
                            style={styles.viewAllBtn}
                            onClick={() => onFilterChange('all')}
                        >
                            📋 Tất cả
                        </button>
                    )}
                    {onClose && (
                        <button 
                            style={styles.closeButton}
                            onClick={onClose}
                            title="Đóng cảnh báo"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Cards - 4 cột */}
            <div style={styles.grid}>
                {activeWarnings.map((warning) => (
                    <WarningCard
                        key={warning.key}
                        warning={warning}
                        onClick={() => onFilterChange(warning.filterValue)}
                        isActive={activeFilter === warning.filterValue}
                    />
                ))}
            </div>

            {/* Footer - Hiển thị filter đang active */}
            {activeFilter !== 'all' && (
                <div style={styles.footer}>
                    <span style={styles.footerText}>
                        🔍 Đang lọc: <strong>{activeWarnings.find(w => w.filterValue === activeFilter)?.title || activeFilter}</strong>
                    </span>
                    <button 
                        style={styles.clearFilterBtn}
                        onClick={() => onFilterChange('all')}
                    >
                        ✕ Bỏ lọc
                    </button>
                </div>
            )}
        </div>
    );
};

// =========================
// SUB-COMPONENT: WarningCard
// =========================

const WarningCard = ({ warning, onClick, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            style={{
                ...styles.card,
                background: warning.bgColor,
                border: `1.5px solid ${isActive ? warning.borderColor : '#e5e7eb'}`,
                boxShadow: isActive ? `0 0 0 2px ${warning.borderColor}30` : 'none',
                ...(isHovered && styles.cardHover)
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
        >
            {/* Icon */}
            <div style={{
                ...styles.iconContainer,
                background: warning.iconBg,
                border: `1px solid ${warning.borderColor}40`
            }}>
                <span style={styles.cardIcon}>{warning.icon}</span>
            </div>

            {/* Content */}
            <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                    <h3 style={{
                        ...styles.cardTitle,
                        color: warning.textColor
                    }}>
                        {warning.title}
                    </h3>
                    <span style={{
                        ...styles.cardCount,
                        background: warning.borderColor,
                        color: 'white'
                    }}>
                        {warning.count}
                    </span>
                </div>
                <p style={{
                    ...styles.cardDescription,
                    color: warning.textColor
                }}>
                    {warning.description}
                </p>
                <div style={styles.cardFooter}>
                    <span style={{
                        ...styles.cardAction,
                        color: warning.textColor
                    }}>
                        {isActive ? '✓ Đang lọc' : (isHovered ? '→ Xem' : 'Nhấn để lọc')}
                    </span>
                </div>
            </div>
        </div>
    );
};

// =========================
// STYLES - Cỡ chữ lớn hơn
// =========================

const styles = {
    container: {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid #f3f4f6'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    headerIcon: {
        fontSize: '22px',
        opacity: 0.8
    },
    headerTitle: {
        fontSize: '17px',
        fontWeight: '600',
        color: '#374151'
    },
    headerBadge: {
        background: '#f3f4f6',
        color: '#6b7280',
        fontSize: '13px',
        fontWeight: '600',
        padding: '2px 12px',
        borderRadius: '20px',
        minWidth: '24px',
        textAlign: 'center'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    viewAllBtn: {
        background: 'transparent',
        border: '1px solid #e5e7eb',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'all 0.15s',
        ':hover': {
            background: '#f9fafb',
            borderColor: '#d1d5db'
        }
    },
    closeButton: {
        background: 'transparent',
        border: 'none',
        fontSize: '20px',
        color: '#9ca3af',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'all 0.15s',
        ':hover': {
            background: '#f3f4f6',
            color: '#6b7280'
        }
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
    },
    card: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '76px'
    },
    cardHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
    },
    iconContainer: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    cardIcon: {
        fontSize: '20px'
    },
    cardContent: {
        flex: 1,
        minWidth: 0
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        marginBottom: '2px'
    },
    cardTitle: {
        fontSize: '15px',
        fontWeight: '600',
        margin: 0,
        whiteSpace: 'nowrap'
    },
    cardCount: {
        fontSize: '13px',
        fontWeight: '700',
        padding: '2px 12px',
        borderRadius: '16px',
        flexShrink: 0
    },
    cardDescription: {
        fontSize: '13px',
        margin: '2px 0 4px 0',
        opacity: 0.65,
        whiteSpace: 'nowrap'
    },
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '2px'
    },
    cardAction: {
        fontSize: '12px',
        fontWeight: '500',
        opacity: 0.55,
        transition: 'opacity 0.2s'
    },
    footer: {
        marginTop: '14px',
        paddingTop: '14px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
    },
    footerText: {
        fontSize: '15px',
        color: '#6b7280'
    },
    clearFilterBtn: {
        background: 'transparent',
        border: '1px solid #e5e7eb',
        padding: '4px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'all 0.15s',
        ':hover': {
            background: '#f9fafb',
            borderColor: '#d1d5db'
        }
    }
};

export default WarningBanner;