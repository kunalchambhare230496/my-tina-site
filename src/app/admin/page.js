"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => signIn()}
        >
          Login with GitHub
        </button>
      </div>
    );
  }

  router.push("/admin/edit-dashboard");
  return null;
}
