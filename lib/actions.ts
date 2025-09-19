"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import z from "zod";
import { revalidatePath } from "next/cache";

export async function addPostAction(prevState: any, formData: FormData) {
  const { userId } = await auth();

  try {
    const user = await currentUser();
    const postText = formData.get("post") as string;
    const postTextSchema = z
      .string()
      .min(1, "ポスト内容を入力してください")
      .max(140, "ポスト内容は140文字以内で入力してください");
    const validatedPostText = postTextSchema.parse(postText);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Ensure User exists (fallback when webhooks haven't populated the DB yet)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!existingUser) {
      // ユーザーが存在しない場合のみ作成
      // usernameが重複する場合はタイムスタンプを付加
      let username = user.username || `user_${user.id}`;
      const userWithSameUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (userWithSameUsername) {
        username = `${username}_${Date.now()}`;
      }

      // emailが重複する場合も処理
      let email =
        user.emailAddresses?.[0]?.emailAddress || `${user.id}@placeholder.com`;
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (userWithSameEmail) {
        email = `${user.id}_${Date.now()}@placeholder.com`;
      }

      await prisma.user.create({
        data: {
          id: user.id,
          clerkId: user.id,
          username,
          name: user.fullName || user.firstName || user.username || username,
          email,
          image: user.imageUrl || null,
        },
      });
    } else {
      // 既存ユーザーの情報を更新（usernameは変更しない）
      const newEmail = user.emailAddresses?.[0]?.emailAddress;

      // 新しいemailが現在のemailと異なる場合のみ更新を試みる
      if (newEmail && newEmail !== existingUser.email) {
        // 他のユーザーがそのemailを使用していないかチェック
        const userWithSameEmail = await prisma.user.findUnique({
          where: { email: newEmail },
        });

        if (!userWithSameEmail) {
          // emailが重複していない場合のみ更新
          await prisma.user.update({
            where: { clerkId: user.id },
            data: {
              email: newEmail,
              image: user.imageUrl || existingUser.image,
            },
          });
        } else {
          // emailが重複している場合は、imageのみ更新
          await prisma.user.update({
            where: { clerkId: user.id },
            data: {
              image: user.imageUrl || existingUser.image,
            },
          });
        }
      } else {
        // emailに変更がない場合は、imageのみ更新
        await prisma.user.update({
          where: { clerkId: user.id },
          data: {
            image: user.imageUrl || existingUser.image,
          },
        });
      }
    }

    await prisma.post.create({
      data: {
        content: validatedPostText,
        authorId: user.id,
      },
    });

    revalidatePath("/");

    return { success: true };
  } catch (e) {
    if (e instanceof z.ZodError) {
      const errorMessage = e.issues.map((issue) => issue.message).join(", ");
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    } else if (e instanceof Error) {
      console.error(e.message);
      return { success: false, error: e.message };
    } else {
      console.error("An unknown error occurred");
      return { success: false, error: "An unknown error occurred" };
    }
  }
}

export const likeAction = async (postId: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      revalidatePath("/");
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      revalidatePath("/");
    }
  } catch (e) {
    console.log(e);
  }
};

export async function followAction(userId: string) {
  const { userId: currentUserId } = await auth();
  console.log("followAction called:", { userId, currentUserId });

  if (!currentUserId) {
    throw new Error("Unauthorized");
  }
  try {
    // まず対象ユーザーのusernameを取得
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!targetUser) {
      throw new Error("User not found");
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    console.log("existingFollow:", existingFollow);

    if (existingFollow) {
      console.log("Deleting follow relationship");
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      console.log("Creating follow relationship");
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: userId,
        },
      });
    }

    // 正しいパスでrevalidate
    console.log("Revalidating path:", `/profile/${targetUser.username}`);
    revalidatePath(`/profile/${targetUser.username}`, 'page');
  } catch (e) {
    console.error("followAction error:", e);
  }
}
