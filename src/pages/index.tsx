import App from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProjectedRouter";


export default function Home() {
  return (
    <div>
        <ProtectedRoute>
          <App/>
        </ProtectedRoute>
    </div>
  );
}
