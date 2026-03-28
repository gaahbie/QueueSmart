import { Outlet } from "react-router";

export default function Root() {
  return (
    <div className="min-h-screen bg-[#F2F4F7] flex">
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
