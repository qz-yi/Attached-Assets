import { useAuth } from "@/hooks/use-auth";
import { useJobs, useAcceptJob } from "@/hooks/use-jobs";
import { JobCard } from "@/components/job-card";
import { PaymentDialog } from "@/components/payment-dialog";
import { Briefcase, CheckCircle2, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ClientDashboard() {
  const { data: user } = useAuth();
  const { data: jobs, isLoading } = useJobs();
  const acceptJob = useAcceptJob();
  const { toast } = useToast();
  
  const [tab, setTab] = useState<'available' | 'accepted'>('available');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const availableJobs = jobs?.filter(j => j.status === 'published') || [];
  const myAcceptedJobs = jobs?.filter(j => j.status === 'accepted' && j.acceptedByClientId === user?.id) || [];

  const handlePreAccept = (id: number) => {
    setSelectedJobId(id);
    setShowPayment(true);
  };

  const handleAcceptSuccess = () => {
    if (!selectedJobId) return;
    acceptJob.mutate(selectedJobId, {
      onSuccess: () => {
        toast({ title: "تم قبول الوظيفة بنجاح!" });
        setTab('accepted'); // switch tab to see full details
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "عذراً", description: "شخص آخر سبقك بقبول الوظيفة" });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            مرحباً {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-orange-50 font-medium">استكشف الفرص المتاحة وابدأ مسيرتك المهنية اليوم.</p>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 max-w-sm">
        <button
          onClick={() => setTab('available')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tab === 'available' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Briefcase className="w-5 h-5" />
          الفرص المتاحة
        </button>
        <button
          onClick={() => setTab('accepted')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tab === 'accepted' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
          طلباتي المقبولة
        </button>
      </div>

      {tab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              role="client" 
              onAccept={() => handlePreAccept(job.id)} 
            />
          ))}
          {availableJobs.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 glass-card rounded-3xl">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">لا توجد وظائف متاحة حالياً</p>
              <p className="text-sm mt-2">يرجى العودة لاحقاً لاستكشاف الفرص الجديدة</p>
            </div>
          )}
        </div>
      )}

      {tab === 'accepted' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAcceptedJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              role="client" 
            />
          ))}
          {myAcceptedJobs.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 glass-card rounded-3xl">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">لم تقم بقبول أي وظيفة بعد</p>
            </div>
          )}
        </div>
      )}

      <PaymentDialog 
        open={showPayment} 
        onOpenChange={setShowPayment} 
        onSuccess={handleAcceptSuccess}
        title="دفع رسوم قبول الوظيفة"
      />
    </div>
  );
}
