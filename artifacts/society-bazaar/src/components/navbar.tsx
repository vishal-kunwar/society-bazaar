import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  mobileContent?: React.ReactNode | ((closeMenu: () => void) => React.ReactNode);
}

export function Navbar({ leftContent, rightContent, mobileContent }: NavbarProps) {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const renderedMobileContent = typeof mobileContent === "function"
    ? mobileContent(closeMenu)
    : mobileContent;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md transition-all">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              GoHust<span className="text-primary">ly</span>
            </span>
          </div>
          {leftContent}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {rightContent}
        </div>

        {/* Mobile hamburger */}
        {mobileContent && (
          <button 
            className="md:hidden p-2 -mr-2 text-foreground/80 hover:text-foreground" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && renderedMobileContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background overflow-hidden shadow-lg"
          >
            {typeof mobileContent === "function" ? (
              <div className="px-4 py-3 flex flex-col gap-2">
                {renderedMobileContent}
              </div>
            ) : (
              <div className="px-4 py-3 flex flex-col gap-2" onClick={closeMenu}>
                {renderedMobileContent}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
