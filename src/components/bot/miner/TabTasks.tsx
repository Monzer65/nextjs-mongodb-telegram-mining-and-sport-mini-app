"use client";

import { useEffect, useState } from "react";
import { useInitData } from "@telegram-apps/sdk-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { fetchUserData } from "@/lib/utils";

export default function TabTasks({
  dictionary,
  lang,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["miner"]["tabs"]["earn-tab"]["tasks-tab"];
  lang: Locale;
}) {
  const mockTasks: Task[] = [
    {
      id: "1",
      description: `${dictionary["task-1-title"]}`,
      chatId: "@ScoreBoardChannel",
      points: 100,
      completed: false,
      channelId: "ScoreBoardChannel",
    },
    {
      id: "2",
      description: `${dictionary["task-2-title"]}`,
      chatId: "@ScoreBoardChat",
      points: 100,
      completed: false,
      channelId: "ScoreBoardChat",
    },
  ];

  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );
  const [checkingTaskId, setCheckingTaskId] = useState<string | null>(null);
  const initTelegramData = useInitData();
  const telegramId = initTelegramData?.user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (data) {
      setCompletedTasks(new Set(data.user?.tasks || []));
    }
  }, [data]);

  const checkMembershipMutation = useMutation({
    mutationFn: async ({
      chatId,
      taskId,
      points,
    }: {
      chatId: string;
      taskId: string;
      points: number;
    }) => {
      if (!telegramId) return false;
      const response = await fetch("/api/users/tasks/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(telegramId),
          chatId,
          taskId,
          points,
        }),
      });
      const data = await response.json();
      return data.isMember;
    },
    onSuccess: (isMember, { taskId }) => {
      if (isMember) {
        setCompletedTasks((prev) => new Set(prev).add(taskId));
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast({
          // title: `${dictionary["on-success-toast"]["no-error"].title}`,
          description: `${dictionary["on-success-toast"]["no-error"].description}`,
          className: "bg-green-600 text-white",
        });
      } else {
        toast({
          // title: `${dictionary["on-success-toast"]["with-error"].title}`,
          description: `${dictionary["on-success-toast"]["with-error"].description}`,
          variant: "destructive",
        });
      }
      setCheckingTaskId(null);
    },
    onError: (error) => {
      toast({
        title: `${dictionary["on-error-toast"].title}`,
        description: `${dictionary["on-error-toast"].description}`,
        variant: "destructive",
      });
      setCheckingTaskId(null);
    },
  });

  const handleTaskCompletion = (
    chatId: string,
    taskId: string,
    points: number
  ) => {
    setCheckingTaskId(taskId);
    checkMembershipMutation.mutate({ chatId, taskId, points });
  };

  const handleSubscribeToChannel = (chatId: string) => {
    const formattedChatId = chatId.startsWith("@") ? chatId.slice(1) : chatId;
    return `https://t.me/${formattedChatId}`;
  };

  const filteredTasks = mockTasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return completedTasks.has(task.id);
    if (filter === "incomplete") return !completedTasks.has(task.id);
    return true;
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader className='border-b'>
        <CardDescription>{dictionary["header-description"]}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        <Select
          value={filter}
          onValueChange={(value: "all" | "completed" | "incomplete") =>
            setFilter(value)
          }
        >
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Filter tasks' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {dictionary.select["all-tasks"]}
            </SelectItem>
            <SelectItem value='completed'>
              {dictionary.select["completed-tasks"]}
            </SelectItem>
            <SelectItem value='incomplete'>
              {dictionary.select["incomplete-tasks"]}
            </SelectItem>
          </SelectContent>
        </Select>
        <ul className='space-y-4 mt-2'>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition'
            >
              <div className='flex-1 mb-2 sm:mb-0'>
                <span
                  className={`text-sm sm:text-base ${
                    completedTasks.has(task.id)
                      ? "text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {task.description}
                </span>
                <span className='block text-xs text-gray-500 mt-1'>
                  {dictionary.points}: {task.points}
                </span>
              </div>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:gap-2 w-full sm:w-auto'>
                <Button
                  onClick={() =>
                    handleTaskCompletion(task.chatId, task.id, task.points)
                  }
                  disabled={
                    completedTasks.has(task.id) || checkingTaskId !== null
                  }
                  variant={
                    completedTasks.has(task.id) ? "secondary" : "default"
                  }
                  className='w-full sm:w-auto'
                >
                  {completedTasks.has(task.id) ? (
                    <>
                      <CheckCircle2
                        className={`${lang === "en" ? "mr-2" : "ml-2"} h-4 w-4`}
                      />
                      {dictionary["check-button-complete"]}
                    </>
                  ) : checkingTaskId === task.id ? (
                    <>
                      <Loader2
                        className={`${
                          lang === "en" ? "mr-2" : "ml-2"
                        } h-4 w-4 animate-spin`}
                      />
                      {dictionary["check-button-loading"]}...
                    </>
                  ) : (
                    `${dictionary["check-button"]}`
                  )}
                </Button>
                {!completedTasks.has(task.id) && (
                  <Button
                    asChild
                    variant='outline'
                    className='w-full sm:w-auto'
                  >
                    <Link href={handleSubscribeToChannel(task.chatId)}>
                      <ExternalLink
                        className={`${lang === "en" ? "mr-2" : "ml-2"} h-4 w-4`}
                      />
                      {dictionary["join-button"]}
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
