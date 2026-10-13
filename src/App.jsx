import { useEffect, useRef, useState } from "react";
import AppRoutes from "./AppRoutes";
import Footer from "./components/footer";
import Header from "./components/header";
import Toast from "./components/toast";
import { initialOrders, initialProducts } from "./data";
import styles from "./App.module.css";

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const newOrders = orders.filter((order) => order.status === "New").length;

  const notify = (message, type = "success") => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const saveProduct = (values, productId) => {
    if (productId) {
      setProducts((current) => current.map((product) => product.id === productId ? { ...product, ...values } : product));
      notify(values.name + " was updated.");
      return;
    }
    setProducts((current) => [{ ...values, id: "p-" + Date.now(), sold: 0, icon: "box" }, ...current]);
    notify(values.name + " was added to your catalog.");
  };

  const deleteProduct = (productId) => {
    const product = products.find((item) => item.id === productId);
    setProducts((current) => current.filter((item) => item.id !== productId));
    if (product) notify(product.name + " was removed from your catalog.", "info");
  };

  const adjustStock = (productId, amount, reason = "Stock correction") => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setProducts((current) => current.map((item) => item.id === productId ? { ...item, stock: Math.max(0, item.stock + amount) } : item));
    notify(product.name + " stock adjusted: " + reason + ".");
  };

  const setOrderStatus = (orderId, status) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    notify("Order " + orderId + " is now " + status.toLowerCase() + ".");
  };

  return (
    <div className={styles.app}>
      <Header newOrders={newOrders} />
      <main id="main-content" className={styles.main}>
        <AppRoutes
          products={products}
          orders={orders}
          onSaveProduct={saveProduct}
          onDeleteProduct={deleteProduct}
          onAdjustStock={adjustStock}
          onSetOrderStatus={setOrderStatus}
          onNotify={notify}
        />
      </main>
      <Footer />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;