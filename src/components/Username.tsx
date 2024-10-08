"use client";

import { useInitData } from "@telegram-apps/sdk-react";

const Username = () => {
  const username = useInitData()?.user?.firstName;
  return <span>{username}</span>;
};

export default Username;
