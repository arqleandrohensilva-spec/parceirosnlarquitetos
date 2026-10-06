import { createFileRoute, redirect } from "@tanstack/react-router";

// A raiz redireciona pra /parceiros (a única página do app), para que o
// domínio "pelado" (sem /parceiros) também abra a página.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/parceiros" });
  },
});
