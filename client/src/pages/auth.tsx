import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BriefcaseBusiness, User as UserIcon, Building2, ShieldCheck, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'employer' | 'client'>('client');
  const { toast } = useToast();
  
  const login = useLogin();
  const register = useRegister();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    location: "",
    gender: "",
    age: ""
  });

  const ADMIN_EMAIL = "3lialmalke@gmail.com";
  const isAdminLogin = mode === 'login' && formData.email === ADMIN_EMAIL;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      login.mutate({ 
        email: formData.email, 
        password: isAdminLogin ? undefined : formData.password 
      }, {
        onError: (err) => toast({ variant: "destructive", title: "خطأ", description: err.message })
      });
    } else {
      register.mutate({
        ...formData,
        role,
        age: parseInt(formData.age) || null
      }, {
        onError: (err) => toast({ variant: "destructive", title: "خطأ", description: err.message })
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl items-center justify-center shadow-xl shadow-orange-500/30 mb-6 relative">
            <BriefcaseBusiness className="w-10 h-10 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md -z-10" />
          </div>
          <h1 className="font-display font-black text-4xl text-slate-800 mb-2">مصرف الوظائف</h1>
          <p className="text-slate-500 text-lg">منصتك الأولى للبحث عن عمل وتوظيف الكفاءات</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2rem] p-8">
          
          {/* Role Toggle for Registration */}
          {mode === 'register' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === 'client' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserIcon className="w-5 h-5" />
                باحث عن عمل
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === 'employer' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 className="w-5 h-5" />
                صاحب عمل
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Hide password field entirely if it's admin bypass */}
            {(!isAdminLogin) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  required={!isAdminLogin}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </motion.div>
            )}

            {isAdminLogin && (
              <div className="bg-purple-50 text-purple-700 p-4 rounded-xl flex items-center gap-3 border border-purple-100">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-bold text-sm">تم تفعيل الدخول كمسؤول</span>
              </div>
            )}

            {mode === 'register' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                {role === 'client' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">العمر</label>
                      <input
                        type="number"
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">الجنس</label>
                      <select
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="">اختر...</option>
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الموقع / العنوان</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    dir="ltr"
                    placeholder="07..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={login.isPending || register.isPending}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {(login.isPending || register.isPending) ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'login' ? "دخول" : "إنشاء حساب")}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500">
            {mode === 'login' ? (
              <p>ليس لديك حساب؟ <button onClick={() => setMode('register')} className="text-orange-600 font-bold hover:underline">سجل الآن</button></p>
            ) : (
              <p>لديك حساب مسبقاً؟ <button onClick={() => setMode('login')} className="text-orange-600 font-bold hover:underline">تسجيل الدخول</button></p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
