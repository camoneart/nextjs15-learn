import { prisma } from "./prisma";

export async function fetchPosts(userId: string) {
  const followingIds = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  const followingIdsArray = followingIds.map((follow) => follow.followingId);

  return await prisma.post.findMany({
    where: {
      authorId: {
        in: [userId, ...followingIdsArray],
      },
    },
    include: {
      author: true,
      likes: {
        select: {
          userId: true,
        },
      },
      replies: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
