const styles = {

    // Background toàn màn hình
    page: {
        width: "100%",
        height: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
    },

    // Container chính
    container: {
        width: "1100px",
        height: "650px",
        backgroundColor: "#fff",
        display: "flex",
        borderRadius: "25px",
        overflow: "hidden",
        boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
    },

    // LEFT
    leftSide: {
        flex: 1,
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
    },

    overlay: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    },

    logo: {
        width: "500px",
        objectFit: "contain",

    },

    title: {
        fontSize: "30px",
        color: "#ff6b00",
        marginBottom: "15px",
    },

    description: {
        fontSize: "16px",
        color: "#666",
        lineHeight: "28px",
        maxWidth: "350px",
    },

    // RIGHT
    rightSide: {
        flex: 1,
        backgroundColor: "#ff6b00",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    form: {
        width: "320px",
        backgroundColor: "#fff",
        padding: "35px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },

    input: {
        padding: "13px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        fontSize: "15px",
        outline: "none",
    },

    button: {
        padding: "13px",
        backgroundColor: "#ff6b00",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "bold",
    },

};

export default styles;