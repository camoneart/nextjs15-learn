"use client";

// components/PostForm.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon } from "./Icons";
import { addPostAction } from "@/lib/actions";
import { useState } from "react";
import SubmitButton from "./SubmitButton";

export default function PostForm() {
  const [error, setError] = useState<string | undefined>("");

  async function handleSubmit(formData: FormData) {
    const result = await addPostAction(formData);
    if (!result?.success) {
      setError(result?.error);
      throw new Error(result?.error);
    }
    setError("");
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-10 h-10">
        <AvatarImage src="/placeholder-user.jpg" />
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
      <form action={handleSubmit} className="w-full flex items-center gap-4">
        <Input
          type="text"
          placeholder="What's on your mind?"
          className="flex-1 rounded-full bg-muted px-4 py-2"
          name="post"
        />
        <SubmitButton />
      </form>

      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
}
