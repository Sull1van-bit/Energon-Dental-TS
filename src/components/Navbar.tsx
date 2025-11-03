import { Button } from "@/components/ui/button.tsx";
import { Menu, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
              <Link to="/"><img src={logo} alt="DentalPro Logo" className="w-full h-10" /></Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/about-us" className="text-foreground hover:text-primary transition-colors">
              About us
            </Link>
            <Link to="/events" className="text-foreground hover:text-primary transition-colors">
              Our Events
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-foreground">
              <Mail className="w-4 h-4 mr-2" />
              Contact us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Products
              </Link>
              <Link to="/about-us" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                About us
              </Link>
              <Link to="/events" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Our Events
              </Link>
              <Button variant="default" size="sm" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Contact us
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
