"use client";

import React, { useState } from "react";
import { axiosFetch } from "@/utils";
import { RiCloseLine } from "react-icons/ri";

const SubmitProposalModal = ({ brief, onClose, onSuccess }: any) => {
  const [price, setPrice] = useState(brief.budget || "");
  const [deliveryTime, setDeliveryTime] = useState(brief.deliveryTime || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !deliveryTime || !coverLetter) {
      setErrorMsg("Please fill in price, delivery time, and cover letter!");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosFetch.post(
        `/briefs/${brief._id}/proposals`,
        {
          price: Number(price),
          deliveryTime: Number(deliveryTime),
          coverLetter,
          attachments: attachmentUrl ? [attachmentUrl] : []
        }
      );
      if (!response.data.error) {
        onSuccess(response.data.proposal || response.data);
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Proposal submission failed.";
      setErrorMsg(msg);
      
      if (msg.toLowerCase().includes("already submitted")) {
        setTimeout(() => {
          onSuccess(null, true);
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-[520px] max-h-[calc(100vh-40px)] rounded-2xl p-0 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center py-4 px-6 border-b border-slate-100 bg-white shrink-0">
          <h3 className="text-lg font-bold text-slate-900 m-0 truncate pr-2">Submit Proposal for: {brief.title}</h3>
          <button type="button" className="bg-transparent border-none text-slate-400 cursor-pointer p-1.5 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-900" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>
        
        {errorMsg && <div className="mx-6 mt-4 bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-200">{errorMsg}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Your Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 250"
              required
              className="p-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Delivery Time (Days)</label>
            <input
              type="number"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="e.g. 4"
              required
              className="p-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Cover Letter</label>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you are the best fit for this project..."
              required
              className="p-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 placeholder:text-slate-400 resize-y min-h-[100px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Attachment URL (Optional)</label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://example.com/portfolio.pdf"
              className="p-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="py-2.5 px-5 rounded-lg text-sm font-medium cursor-pointer transition-colors bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="py-2.5 px-5 rounded-lg text-sm font-medium cursor-pointer transition-colors bg-emerald-500 text-white border-none hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProposalModal;
