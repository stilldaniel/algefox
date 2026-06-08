/**
 * Saves XP to the database for the current user.
 * If you pass total XP, the server keeps the higher value.
 * Only works for Google-authenticated users.
 */
export async function saveUserXP(xpAmount: number): Promise<boolean> {
  try {
    const response = await fetch("/api/user/save-xp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        xpTotal: xpAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to save XP:", errorData.error);
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error saving XP:", error);
    return false;
  }
}

/**
 * Fetches the current user's XP stats
 */
export async function fetchUserXP(): Promise<number> {
  try {
    const response = await fetch("/api/user/save-xp", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user XP");
      return 0;
    }

    const data = await response.json();
    return data.stats?.xp || 0;
  } catch (error) {
    console.error("Error fetching user XP:", error);
    return 0;
  }
}

/**
 * Fetches the leaderboard with top 20 players
 */
export async function fetchLeaderboard(): Promise<
  Array<{
    rank: number;
    userId: string;
    name: string;
    fullName: string;
    xp: number;
  }>
> {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch leaderboard");
      return [];
    }

    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
