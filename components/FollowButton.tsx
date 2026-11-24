"use client";

import { useState } from "react";
import { formatFollowers } from "@/lib/format";

/** UI-only follow button: toggles local state, nothing is saved. */
export default function FollowButton({ followers }: { followers: number }) {
  const [following, setFollowing] = useState(false);
  const count = followers + (following ? 1 : 0);

  return (
    <div className="flex items-center gap-6">
      <p className="text-sm">
        <span className="font-medium tabular-nums">{formatFollowers(count)}</span>{" "}
        <span className="text-mute">Follower</span>
      </p>
      <button
        type="button"
        onClick={() => setFollowing((f) => !f)}
        aria-pressed={following}
        className={`rounded-full border border-ink px-7 py-2.5 text-[11px] uppercase tracking-[0.25em] transition duration-300 ${
          following ? "bg-paper text-ink hover:bg-line" : "bg-ink text-paper hover:bg-paper hover:text-ink"
        }`}
      >
        {following ? "Folgst du" : "Folgen"}
      </button>
    </div>
  );
}
