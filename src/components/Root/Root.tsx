"use client";

import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SDKProvider,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  useBackButton,
} from "@telegram-apps/sdk-react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AppRoot } from "@telegram-apps/telegram-ui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorPage } from "@/components/ErrorPage";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";

import "./styles.css";
import InitialLoading from "@/components/InitLoading";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";
// import { SmartphoneIcon } from "lucide-react";
// import { Button } from "../ui/button";
// import { Link } from "../Link/Link";
// import SecondaryLoading from "../SecondaryLoading";
// import ErrorPage2 from "../ErrorPage2";
// import { SWRConfig } from "swr";
// import { useUser } from "@/hooks/useUser";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Locale } from "@/i18n-config";
import { fetchUserData } from "@/lib/utils";
import { User } from "@/lib/types";

function App(props: PropsWithChildren) {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const isCreatingUserRef = useRef(false); // Synchronous flag for user creation
  const backButton = useBackButton();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  useEffect(() => {
    const locale = pathname.split("/")[1] as Locale;
    const shouldShowBackButton = pathname !== `/${locale}/bot/miner`;

    if (shouldShowBackButton) {
      backButton.show();
    } else {
      backButton.hide();
    }
    backButton.on("click", () => router.replace(`/${locale}/bot/miner`));

    return () => {
      backButton.hide();
    };
  }, [pathname, backButton, router]);

  // if (lp.platform === "tdesktop") {
  //   return (
  //     <Card className='w-full max-w-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
  //       <CardHeader>
  //         <CardTitle className='text-2xl font-bold text-center'>
  //           Mobile Experience Recommended
  //         </CardTitle>
  //         <CardDescription className='text-center'>
  //           For the best experience, we recommend using Telegram on your mobile
  //           device.
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent className='flex justify-center'>
  //         <a href='https://t.me/GoalRushBot' rel='noopener noreferrer'>
  //           {/* <img src="/images/qr.png" alt="@hamster_kombat_bot"> */}
  //           <SmartphoneIcon className='w-24 h-24 text-primary' />
  //         </a>
  //       </CardContent>
  //       <CardFooter className='flex justify-center'>
  //         <a href='https://t.me/GoalRushBot' rel='noopener noreferrer'>
  //           <Button className='w-full sm:w-auto'>
  //             Scoreboard By Goal Rush
  //           </Button>
  //         </a>
  //       </CardFooter>
  //     </Card>
  //   );
  // }

  const fullname = `${lp.initData?.user?.firstName ?? ""} ${
    lp.initData?.user?.lastName ?? ""
  }`.trim();
  const username = lp.initData?.user?.username ?? "";
  const telegramId = lp.initData?.user?.id;
  const ref = searchParams.get("ref");

  const {
    data: userData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => fetchUserData(telegramId),
  });

  // Mutation to create a new user
  const createUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${telegramId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: fullname, username, referralCode: ref }),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setIsCreatingUser(false);
      isCreatingUserRef.current = false;
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });

  // Create user if needed
  useEffect(() => {
    if (!telegramId || userData || isLoading || isCreatingUserRef.current)
      return;

    isCreatingUserRef.current = true;
    setIsCreatingUser(true);
    createUserMutation.mutate();
  }, [telegramId, userData, isLoading, createUserMutation]);

  if (isLoading || isCreatingUser) {
    return (
      <div className='root__loading'>
        <InitialLoading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='root__error'>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='root__error'>
        <p>Unable to load or create user. Please try again later.</p>
      </div>
    );
  }

  return (
    <AppRoot
      appearance={miniApp.isDark ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
    >
      {props.children}
    </AppRoot>
  );
}

function RootInner({ children }: PropsWithChildren) {
  // Mock Telegram environment in development mode if needed.
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTelegramMock();
  }

  const queryClient = new QueryClient();
  const debug = useLaunchParams().startParam === "debug";
  const manifestUrl = useMemo(() => {
    return new URL("tonconnect-manifest.json", window.location.href).toString();
  }, []);
  // use the following in manifest json file:
  //   {
  //     "url": "https://ton-connect.github.io/demo-dapp-with-wallet/",
  //     "name": "Demo Dapp with wallet",
  //     "iconUrl": "https://ton-connect.github.io/demo-dapp-with-wallet/apple-touch-icon.png",
  //     "termsOfUseUrl": "https://ton-connect.github.io/demo-dapp-with-wallet/terms-of-use.txt",
  //     "privacyPolicyUrl": "https://ton-connect.github.io/demo-dapp-with-wallet/privacy-policy.txt"
  // }

  // Enable debug mode to see all the methods sent and events received.
  useEffect(() => {
    if (debug) {
      import("eruda").then((lib) => lib.default.init());
    }
  }, [debug]);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <SDKProvider acceptCustomStyles debug={debug}>
        <QueryClientProvider client={queryClient}>
          <App>{children}</App>{" "}
        </QueryClientProvider>
      </SDKProvider>
    </TonConnectUIProvider>
  );
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of the Server Side
  // Rendering. That's why we are showing loader on the server side.
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <div className='root__loading'>
      <InitialLoading />
    </div>
  );
}
