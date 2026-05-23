function Dashboard() {

    return (

        <div>

            <h1
                style={{
                    marginBottom: "30px"
                }}
            >
                Dashboard
            </h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px"
                }}
            >

                <div style={cardStyle}>
                    <h2>150</h2>
                    <p>Sản phẩm</p>
                </div>

                <div style={cardStyle}>
                    <h2>45</h2>
                    <p>Đơn hàng</p>
                </div>

                <div style={cardStyle}>
                    <h2>12</h2>
                    <p>Người dùng</p>
                </div>

                <div style={cardStyle}>
                    <h2>25M</h2>
                    <p>Doanh thu</p>
                </div>

            </div>

        </div>
    );
}

const cardStyle = {
    background: "white",

    padding: "30px",

    borderRadius: "20px",

    boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
};

export default Dashboard;