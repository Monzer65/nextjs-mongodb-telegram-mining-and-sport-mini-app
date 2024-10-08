import { useQuery } from "@tanstack/react-query";

async function fetchLeaderboard(telegramId: number | null, limit: number) {
  if (!telegramId) {
    return null;
  }
  const response = await fetch(
    `/api/users/leaderboard?telegramId=${telegramId}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return response.json();
}

export function useLeaderboard(telegramId: number | null, limit: number = 10) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["leaderboard", telegramId, limit],
    queryFn: () => fetchLeaderboard(telegramId, limit),
    enabled: !!telegramId,
    retry: 3,
  });

  return {
    leaderboard: data?.leaderboard ?? [],
    userRank: data?.userRank,
    userScore: data?.userScore,
    isLoading,
    isError: !!error,
    refetch,
  };
}
