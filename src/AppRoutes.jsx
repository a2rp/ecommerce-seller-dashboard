import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Loading from "./components/loading";
import { scrollToTop } from "./utils/scrollToTop";

const OverviewPage = lazy(() => import("./pages/overview"));
const OrdersPage = lazy(() => import("./pages/orders"));
const ProductsPage = lazy(() => import("./pages/products"));
const InventoryPage = lazy(() => import("./pages/inventory"));

const AppRoutes = (props) => {
  const location = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <Suspense key={location.pathname} fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage {...props} />} />
        <Route path="/orders" element={<OrdersPage {...props} />} />
        <Route path="/products" element={<ProductsPage {...props} />} />
        <Route path="/inventory" element={<InventoryPage {...props} />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;