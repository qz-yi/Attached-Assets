import { useAuth } from "@/hooks/use-auth";
import { useJobs, useCreateJob } from "@/hooks/use-jobs";
import { useUsers } from "@/hooks/use-users";
import { JobCard } from "@/components/job-card";
import { PaymentDialog } from "@/components/payment-dialog";
import { PlusCircle, ListTodo, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function EmployerDashboard() {
  const { data: user } = useAuth();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: users } = useUsers(); // Need this to find accepted client details
  const createJob = useCreateJob();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    workType: "", requiredAge: "", requiredGender: "", description: "",
    salary: "", workHours: "", shopName: "", shopLocation: "", phone: ""
  });

  const isCreateRoute = location === "/employer/create";
  
  // Filter jobs belonging to this employer
  const myJobs = jobs?.filter(j => j.employerId === user?.id) || [];

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true); // Show payment before actually creating
  };

  const handleCreateSuccess = () => {
    createJob.mutate({ ...formData, employerId: user?.id }, {
      onSuccess: () => {
        toast({ title: "تم نشر الوظيفة بنجاح!" });
        setLocation("/"); // Redirect to list
        setFormData({
          workType: "", requiredAge: "", requiredGender: "", description: "",
          salary: "", workHours: "", shopName: "", shopLocation: "", phone: ""
        });
      },
      onError: (err) => toast({ variant: "destructive", title: "خطأ", description: err.message })
    });
  };

  if (jobsLoading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-8">
      
      {!isCreateRoute ? (
        <>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">إعلاناتي</h1>
              <p className="text-slate-500">تابع الوظائف التي قمت بنشرها ومن وافق عليها</p>
            </div>
            <button 
              onClick={() => setLocation("/employer/create")}
              className="flex items-center gap-2 bg-orange-100 text-orange-600 hover:bg-orange-200 px-5 py-3 rounded-xl font-bold transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              إضافة وظيفة جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myJobs.map(job => {
              const acceptedUser = users?.find(u => u.id === job.acceptedByClientId);
              return (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  role="employer" 
                  acceptedUser={acceptedUser}
                />
              );
            })}
            
            {myJobs.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 glass-card rounded-3xl">
                <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl">لم تقم بنشر أي وظائف بعد</p>
                <button 
                  onClick={() => setLocation("/employer/create")}
                  className="mt-4 text-orange-500 font-bold hover:underline"
                >
                  انشر وظيفتك الأولى الآن
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">إضافة طلب وظيفة</h1>
            <p className="text-slate-500">أدخل تفاصيل الوظيفة للبحث عن الموظف المناسب.</p>
          </div>

          <form onSubmit={handlePreSubmit} className="glass-card p-8 rounded-3xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نوع العمل</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
                  value={formData.workType} onChange={e => setFormData({...formData, workType: e.target.value})} placeholder="مثال: بائع، محاسب..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الراتب</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
                  value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="مثال: 500,000 دينار" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">العمر المطلوب</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
                  value={formData.requiredAge} onChange={e => setFormData({...formData, requiredAge: e.target.value})} placeholder="مثال: 18-25 سنة" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الجنس المطلوب</label>
                <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none"
                  value={formData.requiredGender} onChange={e => setFormData({...formData, requiredGender: e.target.value})}>
                  <option value="">اختر...</option>
                  <option value="أي">أي</option>
                  <option value="ذكر">ذكر فقط</option>
                  <option value="أنثى">أنثى فقط</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ساعات العمل</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
                  value={formData.workHours} onChange={e => setFormData({...formData, workHours: e.target.value})} placeholder="مثال: 8 صباحاً - 4 عصراً" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف للتواصل</label>
                <input required type="tel" dir="ltr" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none text-right" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="07..." />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم المحل / الشركة</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
                  value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">الموقع (العنوان بالتفصيل)</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none" 
                  value={formData.shopLocation} onChange={e => setFormData({...formData, shopLocation: e.target.value})} />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">وصف تفصيلي للوظيفة</label>
                <textarea required rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none resize-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              نشر الطلب (تكلفة: 5000 دينار)
            </button>
          </form>
        </div>
      )}

      <PaymentDialog 
        open={showPayment} 
        onOpenChange={setShowPayment} 
        onSuccess={handleCreateSuccess}
        title="دفع رسوم نشر الوظيفة"
      />
    </div>
  );
}
