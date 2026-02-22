import { useUsers, useToggleUserStatus } from "@/hooks/use-users";
import { useJobs, useUpdateJobStatus } from "@/hooks/use-jobs";
import { JobCard } from "@/components/job-card";
import { ShieldAlert, Users, Briefcase, Power, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const toggleStatus = useToggleUserStatus();
  const updateJob = useUpdateJobStatus();
  const { toast } = useToast();
  
  const [tab, setTab] = useState<'users' | 'jobs'>('users');

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleStatus.mutate({ id, isActive: !currentStatus }, {
      onSuccess: () => toast({ title: "تم تحديث حالة المستخدم" })
    });
  };

  const handleReserveJob = (id: number) => {
    updateJob.mutate({ id, status: 'reserved_by_admin' }, {
      onSuccess: () => toast({ title: "تم حجز الطلب بنجاح" })
    });
  };

  if (usersLoading || jobsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-orange-500" />
            لوحة تحكم المدير
          </h1>
          <p className="text-slate-300">مراقبة كاملة للنظام، إدارة الحسابات والطلبات.</p>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 max-w-sm">
        <button
          onClick={() => setTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tab === 'users' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="w-5 h-5" />
          المستخدمين
        </button>
        <button
          onClick={() => setTab('jobs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tab === 'jobs' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Briefcase className="w-5 h-5" />
          الطلبات
        </button>
      </div>

      {tab === 'users' && (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-600">الاسم</th>
                  <th className="p-4 font-bold text-slate-600">البريد</th>
                  <th className="p-4 font-bold text-slate-600">الدور</th>
                  <th className="p-4 font-bold text-slate-600">الحالة</th>
                  <th className="p-4 font-bold text-slate-600">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.filter(u => u.role !== 'admin').map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{user.name || '-'}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                        {user.role === 'employer' ? 'صاحب عمل' : 'عميل'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(user.id, !!user.isActive)}
                        className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${user.isActive ? 'text-red-500 hover:bg-red-50 border-red-200' : 'text-green-500 hover:bg-green-50 border-green-200'}`}
                        title={user.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              role="admin" 
              onReserve={() => handleReserveJob(job.id)} 
            />
          ))}
          {(!jobs || jobs.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">لا توجد طلبات وظائف حالياً</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
