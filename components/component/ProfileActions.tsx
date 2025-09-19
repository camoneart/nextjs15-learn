"use client";

import React, { useOptimistic } from "react";
import { Button } from "../ui/button";
import { followAction } from "@/lib/actions";

type ProfileActionsProps = {
  userId: string;
  isCurrentUser: boolean;
  isFollowing: boolean;
  posts: number;
  followers: number;
  following: number;
};

export default function ProfileActions({
  userId,
  isCurrentUser,
  isFollowing,
  posts,
  followers,
  following,
}: ProfileActionsProps) {
  const [optimisticState, addOptimisticState] = useOptimistic(
    { isFollowing, followers },
    (currentState) => ({
      isFollowing: !currentState.isFollowing,
      followers: currentState.isFollowing
        ? currentState.followers - 1
        : currentState.followers + 1,
    })
  );

  const getButtonText = () => {
    if (isCurrentUser) {
      return "Edit Profile";
    }
    return optimisticState.isFollowing ? "Unfollow" : "Follow";
  };

  const getButtonVariant = () => {
    if (isCurrentUser) {
      return "outline";
    }
    return optimisticState.isFollowing ? "destructive" : "default";
  };

  const handleFollowAction = async () => {
    try {
      addOptimisticState();
      await followAction(userId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {/* Stats Section */}
      <div className="mt-6 flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{posts}</div>
          <div className="text-muted-foreground">Posts</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{optimisticState.followers}</div>
          <div className="text-muted-foreground">Followers</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{following}</div>
          <div className="text-muted-foreground">Following</div>
        </div>
      </div>

      {/* Follow/Edit Button */}
      <div className="mt-6">
        <form action={handleFollowAction}>
          <Button className="w-full" variant={getButtonVariant()}>
            {getButtonText()}
          </Button>
        </form>
      </div>
    </>
  );
}