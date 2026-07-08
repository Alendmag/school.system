import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 md:mr-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
