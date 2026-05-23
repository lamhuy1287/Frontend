import {
    useEffect,
    useState
} from "react";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../../services/categoryService";
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

function CategoryList() {

    const [categories, setCategories] =
        useState([]);

    const [name, setName] =
        useState("");

    const [parentId, setParentId] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    // =========================
    // LOAD DATA
    // =========================

const fetchCategories = async () => {

    try {

const res =
    await getCategories();

setCategories(res.data);

    } catch (err) {

        console.log(err);
    }
};

    useEffect(() => {

        fetchCategories();

    }, []);

    // =========================
    // FLATTEN TREE
    // =========================

    const flattenCategories = (
        categories,
        level = 0
    ) => {

        let result = [];

        categories.forEach(category => {

            result.push({
                ...category,
                level
            });

            if (
                category.children &&
                category.children.length > 0
            ) {

                result = [
                    ...result,
                    ...flattenCategories(
                        category.children,
                        level + 1
                    )
                ];
            }
        });

        return result;
    };

    const flatCategories =
        flattenCategories(categories);

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const data = {
                name,
                parent_id:
                    parentId || null
            };

            if (editingId) {

                await updateCategory(
                    editingId,
                    data
                );

            } else {

                await createCategory(data);
            }

            setName("");

            setParentId("");

            setEditingId(null);

            fetchCategories();

        } catch (err) {

            console.log(err);
        }
    };

    // =========================
    // EDIT
    // =========================

    const handleEdit = (category) => {

        setEditingId(category.id);

        setName(category.name);

        setParentId(
            category.parent_id || ""
        );
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

            await deleteCategory(id);

            fetchCategories();

        } catch (err) {

            console.log(err);
        }
    };

return (

    <div style={pageStyle}>

        {/* HEADER */}
        <div style={headerStyle}>

            <h1>
                Quản lý danh mục
            </h1>

        </div>

        {/* FORM CARD */}
        <div style={cardStyle}>

            <form
                onSubmit={handleSubmit}
                style={formStyle}
            >

                <input
                    type="text"
                    placeholder="Tên danh mục"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    style={inputStyle}
                />

                <select
                    value={parentId}
                    onChange={(e) =>
                        setParentId(
                            e.target.value
                        )
                    }
                    style={inputStyle}
                >

                    <option value="">
                        Không có danh mục cha
                    </option>

                    {flatCategories.map(
                        (category) => (

                            <option
                                key={category.id}
                                value={category.id}
                            >

                                {
                                    "-- ".repeat(
                                        category.level
                                    )
                                }

                                {category.name}

                            </option>
                        )
                    )}

                </select>

                <button style={primaryButton}>

                    {editingId
                        ? "Cập nhật"
                        : "Thêm"}

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

                <table style={tableStyle}>

                    <thead>

                        <tr>

                            <th style={thStyle}>
                                ID
                            </th>

                            <th style={thStyle}>
                                Tên danh mục
                            </th>

                            <th style={thStyle}>
                                Level
                            </th>

                            <th style={thStyle}>
                                Hành động
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {flatCategories.map(
                            (category) => (

                                <tr
                                    key={category.id}
                                >

                                    <td style={tdStyle}>
                                        {category.id}
                                    </td>

                                    <td style={tdStyle}>

                                        {
                                            "-- ".repeat(
                                                category.level
                                            )
                                        }

                                        {category.name}

                                    </td>

                                    <td style={tdStyle}>
                                        {category.level}
                                    </td>

                                    <td style={tdStyle}>

                                        <button
                                            onClick={() =>
                                                handleEdit(
                                                    category
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
                                                    category.id
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
                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    </div>
);
}



export default CategoryList;