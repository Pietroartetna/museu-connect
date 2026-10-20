import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/profilo")({
  beforeLoad: () => { throw redirect({ to: "/", replace: true }); },
});
