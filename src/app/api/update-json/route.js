import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const REPO_OWNER = "kunalchambhare230496"; // Change this to your username
const REPO_NAME = "my-tina-site"; // Change this to your repo name
const FILE_PATH = "src/website.json"; // Path inside your repo
const BRANCH = "main"; // Target branch

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.accessToken) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = session.user.accessToken;

  try {
    // ✅ 1️⃣ Read the existing local JSON file
    const localPath = path.join(process.cwd(), FILE_PATH);
    const fileContent = await fs.readFile(localPath, "utf-8");
    const jsonData = fileContent.trim() ? JSON.parse(fileContent) : {};


    // ✅ 2️⃣ Append some random test data
    jsonData.testData = `Random value: ${Math.random().toString(36).substring(7)}`;

    // ✅ 3️⃣ Convert JSON to Base64 format
    const updatedContent = Buffer.from(JSON.stringify(jsonData, null, 2)).toString("base64");

    // ✅ 4️⃣ Fetch the existing file from GitHub to get 'sha'
    const fileRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!fileRes.ok) throw new Error("Failed to fetch file from GitHub");

    const fileData = await fileRes.json();
    const sha = fileData.sha; // Needed to update the file

    // ✅ 5️⃣ Commit & push the changes to GitHub
    const updateRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: "Updated website.json via Next.js",
          content: updatedContent,
          sha, // Required for updating
          branch: BRANCH,
        }),
      }
    );

    if (!updateRes.ok) throw new Error("Failed to update file");

    // ✅ 6️⃣ Save the updated JSON locally as well
    await fs.writeFile(localPath, JSON.stringify(jsonData, null, 2));

    return NextResponse.json({ success: true, message: "JSON file updated successfully!" });
  } catch (error) {
    console.error("GitHub API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
