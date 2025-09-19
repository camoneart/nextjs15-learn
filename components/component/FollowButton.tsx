"use client";

import React, { useOptimistic } from "react";
import { Button } from "../ui/button";
import { followAction } from "@/lib/actions";

type FollowButtonProps = {
  isCurrentUser: boolean;
  isFollowing: boolean;
  userId: string;
  onFollowChange?: () => void;
};

const FollowButton = ({
  isCurrentUser,
  isFollowing,
  userId,
  onFollowChange,
}: FollowButtonProps) => {
  const [optimisticIsFollowing, addOptimisticIsFollowing] = useOptimistic(
      isFollowing,
    (currentState) => !currentState,
  );

  const getButtonText = () => {
    if (isCurrentUser) {
      return "Edit Profile";
    }
    return optimisticIsFollowing ? "Unfollow" : "Follow";
  };

  const getButtonVariant = () => {
    if (isCurrentUser) {
      return "outline";
    }
    return optimisticIsFollowing ? "destructive" : "default";
  };

  const handleFollowAction = async () => {
    try {
      addOptimisticIsFollowing(!optimisticIsFollowing);
      onFollowChange?.(); // フォロワー数の楽観的更新をトリガー
      await followAction(userId);
    } catch(e) {
      console.log(e);
    }
  }

  return (
    <form action={handleFollowAction}>
      <Button className="w-full" variant={getButtonVariant()}>
        {getButtonText()}
      </Button>
    </form>
  );
};

export default FollowButton;
