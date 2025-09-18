// components/PostList.tsx
import { auth } from "@clerk/nextjs/server";
import { fetchPosts } from "@/lib/postDataFetcher";
import Post from "../component/Post";

export default async function PostList() {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const posts = await fetchPosts(userId);

  return (
    <div className="space-y-4">
      {posts.length ? (
        posts.map((post) => <Post key={post.id} post={post} userId={userId} />)
      ) : (
        <div className="text-center text-muted-foreground">No posts found</div>
      )}
    </div>
  );
}
