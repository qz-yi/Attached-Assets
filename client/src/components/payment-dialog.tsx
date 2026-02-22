import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  amount?: number;
  title?: string;
}

export function PaymentDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  amount = 5000,
  title = "تأكيد الدفع" 
}: PaymentDialogProps) {
  const [method, setMethod] = useState<'zain' | 'mastercard' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    if (!method) return;
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setMethod(null);
        onOpenChange(false);
        onSuccess();
      }, 1500);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center text-slate-800">{title}</DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-lg mt-2">
            يرجى دفع مبلغ <span className="font-bold text-orange-600">{amount.toLocaleString()} دينار</span> لإتمام العملية
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-12 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-display font-bold text-2xl text-green-600">تم الدفع بنجاح</h3>
          </motion.div>
        ) : (
          <div className="py-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMethod('zain')}
                className={`
                  flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all
                  ${method === 'zain' 
                    ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10' 
                    : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50'}
                `}
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-red-500">
                  <Wallet className="w-7 h-7" />
                </div>
                <span className="font-bold text-slate-700">زين كاش</span>
              </button>

              <button
                onClick={() => setMethod('mastercard')}
                className={`
                  flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all
                  ${method === 'mastercard' 
                    ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10' 
                    : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50'}
                `}
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-blue-500">
                  <CreditCard className="w-7 h-7" />
                </div>
                <span className="font-bold text-slate-700">ماستر كارد</span>
              </button>
            </div>

            <button
              onClick={handlePayment}
              disabled={!method || isProcessing}
              className={`
                w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all
                ${!method || isProcessing 
                  ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5'}
              `}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري المعالجة...
                </span>
              ) : (
                "تأكيد الدفع"
              )}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
