"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import z from "zod";

export async function addPostAction(formData: FormData) {

  const { userId } = await auth();

  try {
    const user = await currentUser();
    const postText = formData.get("post") as string;
    const postTextSchema = z
      .string()
      .min(1, "ポスト内容を入力してください")
      .max(140, "ポスト内容は140文字以内で入力してください");
    const validatedPostText = postTextSchema.parse(postText);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Ensure User exists (fallback when webhooks haven't populated the DB yet)
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        clerkId: user.id,
        username: user.username || `user_${user.id}`,
        email:
          user.emailAddresses?.[0]?.emailAddress ||
          `${user.id}@placeholder.com`,
        image: user.imageUrl || null,
      },
    });

    await prisma.post.create({
      data: {
        content: validatedPostText,
        authorId: user.id,
      },
    });

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