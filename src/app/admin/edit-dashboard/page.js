"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EditDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/admin");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Edit Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>
      
      <button
        onClick={() => signOut()}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
