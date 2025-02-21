"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/admin");
    return null;
  }

  const updateJsonFile = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/update-json", {
      method: "POST",
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      setMessage("✅ JSON file updated successfully!");
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Edit Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>

      {/* ✅ Button to Update JSON & Push */}
      <button
        onClick={updateJsonFile}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update JSON & Push"}
      </button>

      {/* ✅ Display message */}
      {message && <p className="mt-4">{message}</p>}

      {/* ✅ Sign Out Button */}
      <button
        onClick={() => signOut()}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
