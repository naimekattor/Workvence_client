"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import { CheckCircle2 } from "lucide-react";

const Success: React.FC = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const payment_intent = searchParams.get("payment_intent");
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    (async () => {
      try {
        await axiosFetch.patch("/orders", { payment_intent });
        setTimeout(() => {
          navigate.push("/orders");
        }, 5000);
      } catch (err: any) {
        console.log(err?.response?.data?.message || err?.message);
      }
    })();
  }, [navigate, payment_intent]);

  return (
    <div className="w-[90%] max-w-lg mx-auto text-center min-h-[450px] flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 animate-bounce">
        <CheckCircle2 size={36} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Payment Successful!</h2>
      <p className="text-slate-600 text-base max-w-md">
        You are being redirected to your orders page. Please do not close this page...
      </p>
      <div className="mt-4">
        <Loader size={30} />
      </div>
    </div>
  );
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[400px] flex items-center justify-center"><Loader size={45} /></div>}>
      <Success />
    </Suspense>
  );
}
