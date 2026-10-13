import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiPlus, FiShoppingBag } from "react-icons/fi";
import styles from "./styles.module.css";

const routes = [
  { to: "/overview", label: "Overview" },
  { to: "/orders", label: "Orders" },
  { to: "/products", label: "Products" },
  { to: "/inventory", label: "Inventory" },
];

const Header = ({ newOrders = 0 }) => {
  const [notificationPath, setNotificationPath] = useState(null);
  const popoverRef = useRef(null);
  const location = useLocation();
  const notificationsOpen = notificationPath === location.pathname;
  const navigate = useNavigate();

useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setNotificationPath(null);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationPath(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const openNewProduct = () => navigate("/products", { state: { openCreate: true } });

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <NavLink className={styles.brand} to="/overview" aria-label="Tandem Seller Studio home">
          <span className={styles.brandMark}><FiShoppingBag aria-hidden="true" /></span>
          <span className={styles.brandName}>tandem<span>.</span></span>
          <span className={styles.brandDivider} />
          <span className={styles.brandProduct}>Seller Studio</span>
        </NavLink>

        <nav className={styles.navigation} aria-label="Main navigation">
          {routes.map((route) => (
            <NavLink
              className={({ isActive }) => isActive ? [styles.navLink, styles.active].join(" ") : styles.navLink}
              key={route.to}
              to={route.to}
            >
              {route.label}
              {route.label === "Orders" && newOrders > 0 && <span className={styles.orderCount}>{newOrders}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.notificationWrap} ref={popoverRef}>
            <button
              className={styles.notificationButton}
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationPath((path) => path === location.pathname ? null : location.pathname)}
            >
              <FiBell aria-hidden="true" />
              {newOrders > 0 && <span className={styles.notificationDot} />}
            </button>
            {notificationsOpen && (
              <div className={styles.notificationPanel} role="dialog" aria-label="Store notifications">
                <div className={styles.notificationHeading}>
                  <strong>Store pulse</strong>
                  <button type="button" onClick={() => setNotificationPath(null)} aria-label="Close notifications"><FiChevronDown aria-hidden="true" /></button>
                </div>
                {newOrders > 0 ? (
                  <button className={styles.notificationItem} type="button" onClick={() => navigate("/orders")}>
                    <span className={styles.notificationIcon}><FiShoppingBag aria-hidden="true" /></span>
                    <span><strong>{newOrders} orders need attention</strong><small>New orders are waiting in your queue.</small></span>
                  </button>
                ) : (
                  <p className={styles.quietNotice}>You are all caught up. New store activity will show here.</p>
                )}
              </div>
            )}
          </div>
          <button className={styles.addButton} type="button" onClick={openNewProduct}>
            <FiPlus aria-hidden="true" /><span>New listing</span>
          </button>
          <div className={styles.profile} aria-label="Store profile">
            <span className={styles.profileAvatar}>H</span>
            <span className={styles.profileCopy}><strong>Harbor Goods</strong><small>Owner account</small></span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;