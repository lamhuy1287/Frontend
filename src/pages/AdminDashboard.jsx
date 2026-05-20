function AdminDashboard() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (

        <div style={{ padding: "40px" }}>

            <h1>Admin Dashboard</h1>

            <h2>
                Xin chào {user.name}
            </h2>

        </div>

    );
}

export default AdminDashboard;