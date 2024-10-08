import { useQuery } from "@tanstack/react-query";

export default function useUserData(telegramId: number | null) {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!telegramId) throw new Error("No Telegram ID provided");
      const response = await fetch(`/api/users/${telegramId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
    enabled: !!telegramId,
  });
}
