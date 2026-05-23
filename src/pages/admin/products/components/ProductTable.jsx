function ProductTable({
    products,
    handleDelete,
    navigate
}) {

    // =========================
    // LIMIT NAME
    // =========================
    const truncateText = (
        text,
        maxLength = 20
    ) => {

        if (!text) return "";

        return text.length > maxLength
            ? text.slice(0, maxLength) + "..."
            : text;
    };

    return (

        <div style={tableContainer}>

            <table style={tableStyle}>

                <thead>

                    <tr>

                        <th style={thStyle}>
                            STT
                        </th>

                        <th style={thStyle}>
                            Tên SP
                        </th>

                        <th style={thStyle}>
                            Mã SP
                        </th>

                        <th style={thStyle}>
                            Variants
                        </th>

                        <th style={thStyle}>
                            Hành động
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {products.map(
                        (product, index) => (

                            <tr
                                key={product.id}
                                style={trStyle}
                            >

                                {/* STT */}
                                <td style={tdStyle}>
                                    {index + 1}
                                </td>

                                {/* NAME */}
                                <td style={tdStyle}>

                                    {
                                        truncateText(
                                            product.name
                                        )
                                    }

                                </td>

                                {/* CODE */}
                                <td style={tdStyle}>

                                    {
                                        product.product_code
                                    }

                                </td>

                                {/* VARIANTS */}
                                <td style={tdStyle}>

                                    {
                                        product.variants
                                            ?.length || 0
                                    }

                                </td>

                                {/* ACTION */}
                                <td style={tdStyle}>

                                    <button
                                        style={
                                            detailBtn
                                        }
                                        onClick={() =>
                                            navigate(
                                                `/admin/products/${product.id}`
                                            )
                                        }
                                    >
                                        Chi tiết
                                    </button>

                                    <button
                                        style={
                                            deleteBtn
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                product.id
                                            )
                                        }
                                    >
                                        Xóa
                                    </button>

                                </td>

                            </tr>
                        )
                    )}

                </tbody>

            </table>

        </div>
    );
}

// =========================
// STYLES
// =========================

const tableContainer = {
    background: "white",

    padding: "20px",

    borderRadius: "20px",

    boxShadow:
        "0 5px 15px rgba(0,0,0,0.05)"
};

const tableStyle = {
    width: "100%",

    borderCollapse:
        "collapse"
};

const thStyle = {
    textAlign: "left",

    padding: "16px",

    borderBottom:
        "1px solid #eee",

    fontSize: "15px"
};

const tdStyle = {
    padding: "16px",

    borderBottom:
        "1px solid #f3f4f6",

    fontSize: "14px",

    verticalAlign: "middle"
};

const trStyle = {
    transition: "0.2s"
};

const imageStyle = {
    width: "70px",

    height: "70px",

    objectFit: "cover",

    borderRadius: "12px",

    border: "1px solid #eee"
};

const detailBtn = {
    background: "#2563EB",

    color: "white",

    border: "none",

    padding: "8px 14px",

    borderRadius: "8px",

    marginRight: "10px",

    cursor: "pointer"
};

const deleteBtn = {
    background: "#DC2626",

    color: "white",

    border: "none",

    padding: "8px 14px",

    borderRadius: "8px",

    cursor: "pointer"
};

export default ProductTable;