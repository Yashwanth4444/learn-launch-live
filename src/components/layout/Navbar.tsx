
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Home, Upload, BarChart, FlaskConical } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Brain className="h-6 w-6 text-primary" />
          <span className="hidden md:inline">ML Model Explorer</span>
        </Link>
        
        <div className="flex items-center ml-auto gap-1 md:gap-4">
          <NavLink to="/" icon={<Home className="h-4 w-4" />} label="Home" />
          <NavLink to="/dataset" icon={<Upload className="h-4 w-4" />} label="Dataset" />
          <NavLink to="/train" icon={<FlaskConical className="h-4 w-4" />} label="Train" />
          <NavLink to="/visualize" icon={<BarChart className="h-4 w-4" />} label="Results" />
          <Button size="sm" className="ml-2">
            New Project
          </Button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const isActive = window.location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
};

export default Navbar;
