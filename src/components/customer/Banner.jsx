import bannerImg from "../../assets/Banner.png";

function Banner() {

    const styles = {

        banner: {
            width: "100%",
            overflow: "hidden",
        },

        bannerImage: {
            width: "100%",
            height: "auto",

            display: "block",

            objectFit: "cover",
        }

    };

    return (

        <section style={styles.banner}>

            <img
                src={bannerImg}
                alt="Banner"
                style={styles.bannerImage}
            />

        </section>

    );
}

export default Banner;