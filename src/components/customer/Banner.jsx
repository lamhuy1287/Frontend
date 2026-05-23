import bannerImg from "../../assets/Banner.png";

function Banner() {
    return (
        <div className="w-full flex justify-center ">
            <div>
                <img
                    src={bannerImg}
                    alt="Banner"

                />
            </div>
        </div>
    );
}

export default Banner;