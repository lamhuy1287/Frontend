function UserDashboard() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (

        <div style={{ padding: "40px" }}>

            <h1>User Dashboard</h1>

            <h2>
                Xin chào {user.name}
            </h2>

        </div>

    );
}

export default UserDashboard;