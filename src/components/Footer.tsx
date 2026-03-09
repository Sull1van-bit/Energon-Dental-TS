import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="DentalPro Logo" className="w-32 h-auto" />
            </div>
            <p className="text-gray-400 text-sm">
              Empowering dental practices with cutting-edge equipment and solutions.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/about-us" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-white transition-colors">Our Events</Link></li>
              <li>
                <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@gmail.com</li>
              <li>Phone: +62 123-4567-8910</li>
              <li>Address: 123 Jalan sudirman, Medang</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Energon Dental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
