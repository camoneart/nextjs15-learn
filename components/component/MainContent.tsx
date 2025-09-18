import PostForm from "./PostForm";
import PostList from "./PostList";

export default function MainContent() {
  return (
    <div className="grid grid-cols-1 h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-6">
      <PostForm />
      <PostList />
    </div>
  );
}
