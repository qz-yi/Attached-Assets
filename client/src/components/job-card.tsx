import { User, MapPin, Clock, DollarSign, Building2, Phone, Briefcase, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";

interface JobCardProps {
  job: any;
  role: string;
  onAccept?: () => void;
  onReserve?: () => void;
  acceptedUser?: any; // For employers to see who accepted
}

export function JobCard({ job, role, onAccept, onReserve, acceptedUser }: JobCardProps) {
  // Client only sees limited info if published
  const isClientView = role === 'client';
  const showFullDetails = !isClientView || job.status === 'accepted';

  const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accepted: "bg-blue-100 text-blue-700 border-blue-200",
    reserved_by_admin: "bg-purple-100 text-purple-700 border-purple-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    published: "متاح",
    accepted: "تم القبول",
    reserved_by_admin: "محجوز للمدير",
    cancelled: "ملغي",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800">{job.workType}</h3>
            <p className="text-sm text-slate-500 mt-1">
              نُشر في {format(new Date(job.createdAt), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
        </div>
        
        {role !== 'client' && (
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusColors[job.status] || "bg-slate-100 text-slate-700"}`}>
            {statusLabels[job.status] || job.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
        <div className="flex items-center gap-3 text-slate-600">
          <User className="w-5 h-5 text-orange-400" />
          <div>
            <span className="text-xs text-slate-400 block">الجنس المطلوب</span>
            <span className="font-medium">{job.requiredGender}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-slate-600">
          <Clock className="w-5 h-5 text-orange-400" />
          <div>
            <span className="text-xs text-slate-400 block">العمر المطلوب</span>
            <span className="font-medium">{job.requiredAge}</span>
          </div>
        </div>

        {showFullDetails && (
          <>
            <div className="flex items-center gap-3 text-slate-600">
              <DollarSign className="w-5 h-5 text-orange-400" />
              <div>
                <span className="text-xs text-slate-400 block">الراتب</span>
                <span className="font-medium">{job.salary}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-slate-600">
              <Building2 className="w-5 h-5 text-orange-400" />
              <div>
                <span className="text-xs text-slate-400 block">ساعات العمل</span>
                <span className="font-medium">{job.workHours}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {showFullDetails && job.description && (
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-slate-700 leading-relaxed text-sm border border-slate-100">
          {job.description}
        </div>
      )}

      {/* Actions & Full Details for Client/Admin */}
      {showFullDetails && role === 'client' && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-800">تفاصيل التواصل:</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.shopLocation)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
            >
              <MapPin className="w-5 h-5" />
              الموقع ({job.shopName})
            </a>
            <a 
              href={`tel:${job.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Phone className="w-5 h-5" />
              اتصال ({job.phone})
            </a>
          </div>
        </div>
      )}

      {/* Accept Button for Client */}
      {isClientView && job.status === 'published' && (
        <button
          onClick={onAccept}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          قبول الوظيفة
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Admin Actions */}
      {role === 'admin' && job.status === 'published' && onReserve && (
        <button
          onClick={onReserve}
          className="w-full mt-4 bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-xl font-bold transition-colors border border-purple-200"
        >
          حجز الطلب لنفسي
        </button>
      )}

      {/* Employer View - Show Accepted User Info */}
      {role === 'employer' && job.status === 'accepted' && acceptedUser && (
        <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
          <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            بيانات الموظف الذي قبل الطلب
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-slate-500 block">الاسم:</span> <span className="font-bold text-slate-800">{acceptedUser.name}</span></div>
            <div><span className="text-slate-500 block">العمر:</span> <span className="font-bold text-slate-800">{acceptedUser.age}</span></div>
            <div><span className="text-slate-500 block">الجنس:</span> <span className="font-bold text-slate-800">{acceptedUser.gender}</span></div>
            <div><span className="text-slate-500 block">العنوان:</span> <span className="font-bold text-slate-800">{acceptedUser.location}</span></div>
          </div>
          <a 
            href={`tel:${acceptedUser.phone}`}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Phone className="w-5 h-5" />
            اتصال بالموظف
          </a>
        </div>
      )}
    </motion.div>
  );
}
