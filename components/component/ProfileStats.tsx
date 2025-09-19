"use client";

import React, { useOptimistic } from "react";

type ProfileStatsProps = {
  posts: number;
  followers: number;
  following: number;
  isFollowing: boolean;
};

export default function ProfileStats({
  posts,
  followers,
  following,
  isFollowing,
}: ProfileStatsProps) {
  const [optimisticFollowers, _] = useOptimistic(
    followers,
    (currentFollowers) => {
      // フォロー中ならアンフォローで-1、フォローしてないならフォローで+1
      return isFollowing ? currentFollowers - 1 : currentFollowers + 1;
    }
  );

  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{posts}</div>
        <div className="text-muted-foreground">Posts</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{optimisticFollowers}</div>
        <div className="text-muted-foreground">Followers</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{following}</div>
        <div className="text-muted-foreground">Following</div>
      </div>
    </div>
  );
}