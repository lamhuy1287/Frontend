const isMobile = window.innerWidth <= 768;

const styles = {

    // Background toàn màn hình
    page: {
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
        padding: isMobile ? "20px" : "0",
        boxSizing: "border-box",
    },

    // Container chính
    container: {
        width: isMobile ? "100%" : "1100px",
        maxWidth: "1100px",
        height: isMobile ? "auto" : "650px",
        backgroundColor: "#fff",
        display: "flex",
        borderRadius: isMobile ? "18px" : "25px",
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
        width: isMobile ? "90px" : "500px",
        objectFit: "contain",
        marginBottom: isMobile ? "20px" : "0",
    },

    title: {
        fontSize: isMobile ? "24px" : "30px",
        color: "#ff6b00",
        marginBottom: "15px",
    },

    description: {
        fontSize: isMobile ? "14px" : "16px",
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
        padding: isMobile ? "25px 15px" : "0",
    },

    form: {
        width: isMobile ? "100%" : "320px",
        maxWidth: "380px",
        backgroundColor: "#fff",
        padding: isMobile ? "30px 22px" : "35px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        boxSizing: "border-box",
    },

    input: {
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        fontSize: "16px",
        outline: "none",
        boxSizing: "border-box",
    },

    button: {
        padding: "14px",
        backgroundColor: "#ff6b00",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "16px",
        cursor: "pointer",
        fontWeight: "bold",
    },

};

export default styles;