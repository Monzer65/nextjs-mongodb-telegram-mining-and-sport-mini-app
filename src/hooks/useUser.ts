import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser(telegramId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    telegramId ? `/api/users/${telegramId}` : null,
    fetcher,
    {
      errorRetryCount: 2, // Fewer retries to avoid too many 409 errors
      dedupingInterval: 60000, // Deduping interval to avoid excessive requests
    }
  );

  return { data: data?.user, isLoading, error, mutate };
}
