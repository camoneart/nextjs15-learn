"use client";

import React, { useOptimistic } from "react";
import { Button } from "../ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon } from "./Icons";
import { likeAction } from "@/lib/actions";

type PostInteractionProps = {
  initialLikes: string[];
  postId: string;
  commentNumber: number;
  userId: string;
};

type OptimisticLikeState = {
  likeCount: number;
  isLiked: boolean;
};

const PostInteraction = ({
  initialLikes,
  postId,
  commentNumber,
  userId,
}: PostInteractionProps) => {
  const isAlreadyLiked = initialLikes.includes(userId);

  const [optimisticLikeState, addOptimisticLike] = useOptimistic<
    OptimisticLikeState,
    void
  >(
    { likeCount: initialLikes.length, isLiked: isAlreadyLiked },
    (currentLike: OptimisticLikeState, optimisticLikeValue: void) => ({
      likeCount: currentLike.isLiked
        ? currentLike.likeCount - 1
        : currentLike.likeCount + 1,
      isLiked: !currentLike.isLiked,
    })
  );

  const handleLikeSubmit = async () => {
    try {
      addOptimisticLike();
      await likeAction(postId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <form action={handleLikeSubmit}>
        <Button variant="ghost" size="icon">
          <HeartIcon
            className={`h-5 w-5 ${
              optimisticLikeState.isLiked
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          />
        </Button>
      </form>
      <span className="-ml-1">{optimisticLikeState.likeCount}</span>
      <Button variant="ghost" size="icon">
        <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
      </Button>
      <span className="-ml-1">{commentNumber}</span>
      <Button variant="ghost" size="icon">
        <Share2Icon className="h-5 w-5 text-muted-foreground" />
      </Button>
    </div>
  );
};

export default PostInteraction;
