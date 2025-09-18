import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HeartIcon, ClockIcon } from "./Icons";
import PostInteraction from "./PostInteraction";
import { Post as PrismaPost, User, Reply } from "@prisma/client";
import Link from "next/link";

import React from "react";

type PostWithIncludes = PrismaPost & {
  author: User;
  replies: (Reply & { user: User })[];
  likes: { userId: string }[];
  _count: { replies: number };
};

const Post = ({ post, userId }: { post: PostWithIncludes; userId: string }) => {
  return (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
    >
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.image || "/placeholder-user.jpg"} />
            <AvatarFallback>
              {post.author.name?.charAt(0).toUpperCase() ||
               post.author.username?.charAt(0).toUpperCase() ||
               "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h3 className="text-lg font-bold">
            {post.author.name || post.author.username}
          </h3>
          <p className="text-muted-foreground">@{post.author.username}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p>{post.content}</p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <PostInteraction
          commentNumber={post._count.replies}
          postId={post.id}
          initialLikes={post.likes.map((like: any) => like.userId)}
          userId={userId}
        />
        <div className="flex items-center gap-2 text-muted-foreground">
          <ClockIcon className="h-5 w-5" />
          <span>{post.createdAt.toLocaleString()}</span>
        </div>
      </div>
      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 border-t pt-4 space-y-2">
          {post.replies.map((reply, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{reply.user?.username}</p>
                <p className="text-muted-foreground">{reply.content}</p>
              </div>
              <Button variant="ghost" size="icon">
                <HeartIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
