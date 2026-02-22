import { ReactNode } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { BriefcaseBusiness, LogOut, User as UserIcon, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const { data: user } = useAuth();
  const logout = useLogout();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = user ? [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    ...(user.role === 'admin' ? [
      { href: "/admin/users", label: "المستخدمين", icon: UserIcon },
    ] : []),
    ...(user.role === 'employer' ? [
      { href: "/employer/create", label: "إضافة وظيفة", icon: BriefcaseBusiness },
    ] : []),
    ...(user.role === 'client' ? [
      { href: "/client/profile", label: "الملف الشخصي", icon: UserIcon },
    ] : []),
  ] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 border-b-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                <BriefcaseBusiness className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-gradient">مصرف الوظائف</span>
            </Link>

            {/* Desktop Nav */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all
                        ${isActive 
                          ? "bg-orange-50 text-orange-600" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-orange-500"}
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-sm text-right">
                    <p className="font-bold text-slate-800">{user.name || user.email}</p>
                    <p className="text-slate-500">{
                      user.role === 'admin' ? 'المدير' : 
                      user.role === 'employer' ? 'صاحب عمل' : 'باحث عن عمل'
                    }</p>
                  </div>
                  <button
                    onClick={() => logout.mutate()}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {/* Mobile menu button */}
              {user && (
                <button 
                  className="md:hidden p-2 text-slate-600"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 20 }}
              className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white z-50 p-6 shadow-2xl md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-display font-bold text-xl text-orange-600">القائمة</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl font-medium
                      ${location === item.href ? "bg-orange-50 text-orange-600" : "text-slate-600"}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                
                <hr className="my-4 border-slate-100" />
                
                <button
                  onClick={() => { logout.mutate(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-4 rounded-xl font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
