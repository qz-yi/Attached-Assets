import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-users";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Phone, Calendar, Loader2 } from "lucide-react";

export default function ClientProfile() {
  const { data: user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "", gender: "", age: "", location: "", phone: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        gender: user.gender || "",
        age: user.age ? String(user.age) : "",
        location: user.location || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      ...formData,
      age: parseInt(formData.age) || null
    }, {
      onSuccess: () => toast({ title: "تم تحديث الملف الشخصي بنجاح" }),
      onError: (err) => toast({ variant: "destructive", title: "خطأ", description: err.message })
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">الملف الشخصي</h1>
        <p className="text-slate-500">حدث بياناتك لزيادة فرصك في الحصول على وظيفة.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <User className="w-4 h-4 text-orange-500" />
            الاسم الكامل
          </label>
          <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              العمر
            </label>
            <input required type="number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
              value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <User className="w-4 h-4 text-orange-500" />
              الجنس
            </label>
            <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none"
              value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="">اختر...</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            الموقع / العنوان
          </label>
          <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Phone className="w-4 h-4 text-orange-500" />
            رقم الهاتف
          </label>
          <input required type="tel" dir="ltr" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none text-right" 
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {updateProfile.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
          حفظ التعديلات
        </button>
      </form>
    </div>
  );
}
