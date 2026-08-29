import { RouterProvider, useRouter } from "@/router";
import { StoreProvider } from "@/store";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { UserDashboard } from "@/pages/UserDashboard";
import { ProfilePage } from "@/pages/ProfilePage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { AdminDashboard } from "@/pages/AdminDashboard";

function CurrentPage() {
  const { route, session } = useRouter();

  switch (route) {
    case "home":
      return <HomePage />;
    case "login":
      return <LoginPage />;
    case "dashboard":
      return session ? <UserDashboard /> : <LoginPage />;
    case "profile":
      return session ? <ProfilePage /> : <LoginPage />;
    case "documents":
      return session ? <DocumentsPage /> : <LoginPage />;
    case "admin":
      return session?.isAdmin ? <AdminDashboard /> : <LoginPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider>
        <Layout>
          <CurrentPage />
        </Layout>
      </RouterProvider>
    </StoreProvider>
  );
}
