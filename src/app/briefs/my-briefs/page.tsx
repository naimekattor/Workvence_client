"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

const MyBriefs = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, data: briefs = [] } = useQuery({
    queryKey: ["my-briefs"],
    queryFn: () =>
      axiosFetch
        .get("/briefs/my-briefs")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.briefs)) return data.briefs;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  const closeMutation = useMutation({
    mutationFn: (briefId: string) =>
      axiosFetch.patch(`/briefs/${briefId}/close`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-briefs"] });
      toast.success("Project closed successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to close project");
    },
  });

  const filtered = useMemo(() => {
    const briefsArray = Array.isArray(briefs) ? briefs : [];
    if (filter === "all") return briefsArray;
    if (filter === "open")
      return briefsArray.filter((b) => !b.isClosed && b.status !== "closed");
    return briefsArray.filter((b) => b.isClosed || b.status === "closed");
  }, [briefs, filter]);

  const briefsArray = Array.isArray(briefs) ? briefs : [];
  const openCount = briefsArray.filter(
    (b) => !b.isClosed && b.status !== "closed"
  ).length;
  const closedCount = briefsArray.length - openCount;

  if (!user) {
    return (
      <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh] px-4">
        <div className="w-full max-w-[1200px] flex justify-center items-center py-20">
          <Loader size={45} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh] px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6 mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-7 md:px-10 rounded-xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Projects</h1>
            <p className="text-slate-400 text-sm">Manage your posted job projects and review proposals</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <Link href="/briefs" className="py-2.5 px-5 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors text-center w-full sm:w-auto">
              Browse All Projects
            </Link>
            {!user?.isSeller && (
              <Link href="/briefs/create" className="py-2.5 px-5 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-center w-full sm:w-auto">
                + New Project
              </Link>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className={`py-2 px-4.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${filter === "all" ? "bg-emerald-500 text-white border border-emerald-500" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
            onClick={() => setFilter("all")}
          >
            All ({briefsArray.length})
          </button>
          <button
            type="button"
            className={`py-2 px-4.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${filter === "open" ? "bg-emerald-500 text-white border border-emerald-500" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
            onClick={() => setFilter("open")}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            className={`py-2 px-4.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${filter === "closed" ? "bg-emerald-500 text-white border border-emerald-500" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
            onClick={() => setFilter("closed")}
          >
            Closed ({closedCount})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-20">
            <Loader size={45} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {filter === "all"
                ? "No projects yet"
                : `No ${filter} projects`}
            </h3>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              {filter === "all"
                ? "Post your first job project and start receiving proposals from sellers"
                : "No projects match this filter"}
            </p>
            {filter === "all" && !user?.isSeller ? (
              <Link href="/briefs/create" className="py-3 px-6 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer text-center shadow-xs">
                Post Your First Project
              </Link>
            ) : filter !== "all" ? (
              <button type="button" className="py-3 px-6 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer text-center shadow-xs" onClick={() => setFilter("all")}>
                Show All Projects
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((brief) => {
              const isClosed = brief.isClosed || brief.status === "closed";
              return (
                <div
                  key={brief._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all hover:shadow-md hover:border-emerald-500/30 cursor-pointer"
                  onClick={() => router.push(`/briefs/${brief._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 truncate">{brief.title}</h3>
                    <div className="flex gap-4 flex-wrap text-xs text-slate-500">
                      {brief.category && (
                        <span className="flex items-center gap-1">
                          Category:{" "}
                          <span className="font-semibold text-slate-700">{brief.category}</span>
                        </span>
                      )}
                      {brief.budget && (
                        <span className="flex items-center gap-1">
                          Budget:{" "}
                          <span className="font-semibold text-slate-700">${brief.budget}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        Posted:{" "}
                        <span className="font-semibold text-slate-700">
                          {moment(brief.createdAt).fromNow()}
                        </span>
                      </span>
                      {brief.proposalCount !== undefined && (
                        <span className="flex items-center gap-1">
                          Proposals:{" "}
                          <span className="font-semibold text-slate-700">
                            {brief.proposalCount}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2.5 shrink-0 flex-wrap w-full sm:w-auto justify-start sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`py-1 px-3 rounded-full text-xs font-semibold capitalize ${isClosed ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                    >
                      {isClosed ? "Closed" : "Open"}
                    </span>

                    {!isClosed && brief.proposalCount > 0 && (
                      <Link
                        href={`/briefs/${brief._id}/proposals`}
                        className="py-2 px-4 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors"
                      >
                        View Proposals
                      </Link>
                    )}

                    <Link
                      href={`/briefs/${brief._id}`}
                      className="py-2 px-4 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      Details
                    </Link>

                    {!isClosed && (
                      <button
                        type="button"
                        className="py-2 px-4 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        onClick={() => closeMutation.mutate(brief._id)}
                        disabled={closeMutation.isPending}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
const MyProposals = () => {
  const router = useRouter();
  const { isLoading, data: proposals = [] } = useQuery({
    queryKey: ["my-proposals"],
    queryFn: () =>
      axiosFetch
        .get("/briefs/my-proposals")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.proposals)) return data.proposals;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  return (
    <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh] px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6 mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-7 md:px-10 rounded-xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Proposals</h1>
            <p className="text-slate-400 text-sm">Track your submitted proposals for job projects</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <Link href="/briefs" className="py-2.5 px-5 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors text-center w-full sm:w-auto">
              Browse Open Projects
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-20">
            <Loader size={45} />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No proposals submitted</h3>
            <p className="text-slate-500 text-sm max-w-md mb-6">You haven't submitted any proposals yet. Browse open projects and start pitching!</p>
            <Link href="/briefs" className="py-3 px-6 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer text-center shadow-xs">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {proposals.map((proposal: any) => {
              const briefId = proposal.briefID?._id || proposal.briefID;
              return (
                <div
                  key={proposal._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all hover:shadow-md hover:border-emerald-500/30 cursor-pointer"
                  onClick={() => router.push(`/briefs/${briefId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 truncate">
                      {proposal.briefID?.title || "Unknown Project"}
                    </h3>
                    <div className="flex gap-4 flex-wrap text-xs text-slate-500">
                      {proposal.price && (
                        <span className="flex items-center gap-1">
                          Your Offer:{" "}
                          <span className="font-semibold text-slate-700">${proposal.price}</span>
                        </span>
                      )}
                      {proposal.deliveryTime && (
                        <span className="flex items-center gap-1">
                          Delivery:{" "}
                          <span className="font-semibold text-slate-700">{proposal.deliveryTime} Days</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        Submitted:{" "}
                        <span className="font-semibold text-slate-700">
                          {moment(proposal.createdAt).fromNow()}
                        </span>
                      </span>
                    </div>
                    {proposal.coverLetter && (
                      <div className="mt-3.5 text-sm text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Cover Letter:</strong>
                        <div className="mt-1.5 whitespace-pre-wrap">{proposal.coverLetter}</div>
                      </div>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2.5 shrink-0 flex-wrap w-full sm:w-auto justify-start sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/briefs/${briefId}`}
                      className="py-2 px-4 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyBriefsPage() {
  const user = useUserStore((state) => state.user);

  return user?.isSeller ? <MyProposals /> : <MyBriefs />;
}
