// Footer.jsx

import "./Footer.css";

import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaTiktok,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTruck,
    FaShieldAlt,
    FaCreditCard
} from "react-icons/fa";

function Footer() {

    return (

        <footer className="footer">

            {/* Top Footer */}
            <div className="footer-top">

                <div className="footer-container">

                    {/* Brand */}
                    <div className="footer-column">

                        <h2 className="footer-logo">
                            Hobby Corner
                        </h2>

                        <p className="footer-description">
                            Chuyên buôn bán LEGO chính hãng, mô hình xe tỷ lệ 1:64,
                            đồ chơi sưu tầm cao cấp với nhiều mẫu mã độc đáo dành
                            cho người đam mê mô hình.
                        </p>

                        <div className="footer-socials">

                            <a href="#">
                                <FaFacebookF />
                            </a>

                            <a href="#">
                                <FaInstagram />
                            </a>

                            <a href="#">
                                <FaYoutube />
                            </a>

                            <a href="#">
                                <FaTiktok />
                            </a>

                        </div>

                    </div>

                    {/* Contact */}
                    <div className="footer-column">

                        <h3>Thông tin cửa hàng</h3>

                        <ul>

                            <li>
                                <FaMapMarkerAlt />
                                <span>
                                    123 Đường Mô Hình, Hà Nội
                                </span>
                            </li>

                            <li>
                                <FaPhoneAlt />
                                <span>
                                    0123 456 789
                                </span>
                            </li>

                            <li>
                                <FaEnvelope />
                                <span>
                                    support@hobbycorner.vn
                                </span>
                            </li>

                        </ul>

                    </div>

                    {/* Support */}
                    <div className="footer-column">

                        <h3>Hỗ trợ khách hàng</h3>

                        <ul className="footer-links">

                            <li>
                                <a href="#">
                                    Chính sách bảo hành
                                </a>
                            </li>

                            <li>
                                <a href="#">
                                    Chính sách đổi trả
                                </a>
                            </li>

                            <li>
                                <a href="#">
                                    Hướng dẫn mua hàng
                                </a>
                            </li>

                            <li>
                                <a href="#">
                                    Phương thức thanh toán
                                </a>
                            </li>

                            <li>
                                <a href="#">
                                    Liên hệ hỗ trợ
                                </a>
                            </li>

                        </ul>

                    </div>

                    {/* Service */}
                    <div className="footer-column">

                        <h3>Dịch vụ</h3>

                        <div className="service-item">

                            <div className="service-icon">
                                <FaTruck />
                            </div>

                            <div>
                                <h4>Giao hàng toàn quốc</h4>
                                <p>Ship COD nhanh chóng.</p>
                            </div>

                        </div>

                        <div className="service-item">

                            <div className="service-icon">
                                <FaShieldAlt />
                            </div>

                            <div>
                                <h4>Cam kết chính hãng</h4>
                                <p>100% sản phẩm chất lượng.</p>
                            </div>

                        </div>

                        <div className="service-item">

                            <div className="service-icon">
                                <FaCreditCard />
                            </div>

                            <div>
                                <h4>Thanh toán linh hoạt</h4>
                                <p>Hỗ trợ COD & chuyển khoản.</p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Bottom */}
            <div className="footer-bottom">

                <div className="footer-container footer-bottom-content">

                    <p>
                        © 2026 Hobby Corner. All rights reserved.
                    </p>

                    <div className="footer-bottom-links">

                        <a href="#">
                            Điều khoản
                        </a>

                        <a href="#">
                            Bảo mật
                        </a>

                        <a href="#">
                            FAQ
                        </a>

                    </div>

                </div>

            </div>

        </footer>

    );
}

export default Footer;