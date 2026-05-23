import {
    useEffect,
    useState
} from "react";

import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand
} from "../../../services/brandService";
import {
    pageStyle,
    headerStyle,
    cardStyle,
    formStyle,
    inputStyle,
    primaryButton,
    warningButton,
    dangerButton,
    tableContainer,
    tableStyle,
    thStyle,
    tdStyle
} from "../../../components/admin/styles";

function BrandList() {

    const [brands, setBrands] =
        useState([]);

    const [name, setName] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    // =========================
    // LOAD DATA
    // =========================

    const fetchBrands = async () => {

        try {

            const res =
                await getBrands();

setBrands(res.data);

        } catch (err) {

            console.log(err);
        }
    };

    useEffect(() => {

        fetchBrands();

    }, []);

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const data = {
                name
            };

            if (editingId) {

                await updateBrand(
                    editingId,
                    data
                );

            } else {

                await createBrand(data);
            }

            setName("");

            setEditingId(null);

            fetchBrands();

        } catch (err) {

            console.log(err);
        }
    };

    // =========================
    // EDIT
    // =========================

    const handleEdit = (brand) => {

        setEditingId(brand.id);

        setName(brand.name);
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Bạn có chắc muốn xóa?"
            );

        if (!confirmDelete) return;

        try {

            await deleteBrand(id);

            fetchBrands();

        } catch (err) {

            console.log(err);
        }
    };

    return (

        <div style={pageStyle}>

            {/* HEADER */}
            <div style={headerStyle}>

                <h1>
                    Quản lý hãng
                </h1>

            </div>

            {/* FORM */}
            <div style={cardStyle}>

                <form
                    onSubmit={handleSubmit}
                    style={formStyle}
                >

                    <input
                        type="text"
                        placeholder="Tên hãng"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <button
                        style={primaryButton}
                    >

                        {editingId
                            ? "Cập nhật"
                            : "Thêm hãng"}

                    </button>

                </form>

            </div>

            {/* TABLE */}
            <div
                style={{
                    ...cardStyle,
                    marginTop: "30px"
                }}
            >

                <div style={tableContainer}>

                    <table
                        style={tableStyle}
                    >

                        <thead>

                            <tr>

                                <th style={thStyle}>
                                    ID
                                </th>

                                <th style={thStyle}>
                                    Tên hãng
                                </th>

                                <th style={thStyle}>
                                    Hành động
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {brands.map((brand) => (

                                <tr
                                    key={brand.id}
                                >

                                    <td style={tdStyle}>
                                        {brand.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {brand.name}
                                    </td>

                                    <td style={tdStyle}>

                                        <button
                                            onClick={() =>
                                                handleEdit(
                                                    brand
                                                )
                                            }
                                            style={
                                                warningButton
                                            }
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    brand.id
                                                )
                                            }
                                            style={
                                                dangerButton
                                            }
                                        >
                                            Xóa
                                        </button>

                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}



export default BrandList;