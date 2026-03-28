import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import EncounterQueue from "./pages/EncounterQueue";
import EncounterDetail from "./pages/EncounterDetail";
import FullQueue from "./pages/FullQueue";
import PatientWaiting from "./pages/PatientWaiting";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: EncounterQueue },
      { path: "encounter/:encounterId", Component: EncounterDetail },
      { path: "queue", Component: FullQueue },
    ],
  },
  {
    // Patient-facing screen — no clinical sidebar
    path: "/waiting",
    Component: PatientWaiting,
  },
]);