import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/menu/table/$token")({
  component: () => <Outlet />,
});
