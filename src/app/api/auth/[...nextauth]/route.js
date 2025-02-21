import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const githubToken = account.access_token;
      const username = profile.login; // GitHub username

      const repoOwner = "kunalchambhare230496"; // Set your GitHub username
      const repoName = "my-tina-site";

      try {
        // 1️⃣ Check if the user is the **OWNER** of the repository
        const repoRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (repoRes.ok) {
          const repoData = await repoRes.json();
          if (repoData.owner.login === username) {
            console.log(`✅ User is the owner: ${username}`);
            return true;
          }
        }

        // 2️⃣ Check if the user is a **CONTRIBUTOR** of the repository
        const contribRes = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
          {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (contribRes.ok) {
          const contributors = await contribRes.json();
          const isContributor = contributors.some((contributor) => contributor.login === username);

          if (isContributor) {
            console.log(`✅ User is a contributor: ${username}`);
            return true;
          }
        }

        console.log(`❌ Access denied: ${username} is not an owner or contributor.`);
        return false;
      } catch (error) {
        console.error("Error checking GitHub repo access:", error);
        return false;
      }
    },
    async session({ session, token }) {
      session.user.username = token.username;
      session.user.accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.username = profile.login;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
