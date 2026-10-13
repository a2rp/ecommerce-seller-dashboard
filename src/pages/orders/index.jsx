import { useMemo, useState } from "react";
import { FiArrowDown, FiArrowRight, FiCheck, FiDownload, FiFilter, FiPackage, FiSearch, FiShoppingBag, FiTruck, FiX } from "react-icons/fi";
import ConfirmationDialog from "../../components/confirmationDialog";
import Modal from "../../components/modal";
import { formatCurrency, formatShortDate, orderStatuses } from "../../data";
import styles from "./styles.module.css";

const nextStatus = {
  New: "Packing",
  Packing: "Ready to ship",
  "Ready to ship": "Shipped",
  Shipped: "Delivered",
};

const downloadCsv = (rows) => {
  const columns = ["Order", "Customer", "Date", "Items", "Total", "Status", "Channel"];
  const lines = rows.map((order) => [
    order.id,
    order.customer,
    new Date(order.placedAt).toLocaleDateString("en-US"),
    order.items.map((item) => item.quantity + " x " + item.name).join("; "),
    order.total.toFixed(2),
    order.status,
    order.channel,
  ]);
  const csv = [columns, ...lines].map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tandem-orders.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const OrdersPage = ({ orders, onSetOrderStatus }) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All orders");
  const [sort, setSort] = useState("newest");
  const [viewing, setViewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = orders.filter((order) => {
      const matchesQuery = !term || [order.id, order.customer, order.email, order.channel, ...order.items.map((item) => item.name)].some((value) => value.toLowerCase().includes(term));
      return matchesQuery && (status === "All orders" || order.status === status);
    });
    return rows.sort((a, b) => {
      if (sort === "oldest") return new Date(a.placedAt) - new Date(b.placedAt);
      if (sort === "highest") return b.total - a.total;
      if (sort === "lowest") return a.total - b.total;
      return new Date(b.placedAt) - new Date(a.placedAt);
    });
  }, [orders, query, sort, status]);

  const activeOrders = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status));
  const needsPacking = orders.filter((order) => ["New", "Packing"].includes(order.status)).length;
  const shipped = orders.filter((order) => order.status === "Shipped" || order.status === "Delivered").length;
  const openValue = activeOrders.reduce((total, order) => total + order.total, 0);

  const changeStatus = (order, next) => {
    if (next === "Cancelled") {
      setCancelling(order);
      return;
    }
    onSetOrderStatus(order.id, next);
    if (viewing?.id === order.id) setViewing({ ...order, status: next });
  };

  const confirmCancel = () => {
    if (cancelling) onSetOrderStatus(cancelling.id, "Cancelled");
    if (viewing?.id === cancelling?.id) setViewing({ ...viewing, status: "Cancelled" });
    setCancelling(null);
  };

  const clearFilters = () => {
    setQuery("");
    setStatus("All orders");
    setSort("newest");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div><p className={styles.context}>FULFILMENT DESK</p><h1>Orders</h1><p className={styles.subtitle}>Move each customer order from your desk to their door.</p></div>
        <button className={styles.exportButton} type="button" onClick={() => downloadCsv(filtered)}><FiDownload aria-hidden="true" /> Export {filtered.length} orders</button>
      </div>

      <div className={styles.stats}>
        <div><span className={styles.statIcon}><FiShoppingBag aria-hidden="true" /></span><span><small>Open orders</small><strong>{activeOrders.length}</strong></span></div>
        <div><span className={[styles.statIcon, styles.orange].join(" ")}><FiPackage aria-hidden="true" /></span><span><small>To prepare</small><strong>{needsPacking}</strong></span></div>
        <div><span className={[styles.statIcon, styles.blue].join(" ")}><FiTruck aria-hidden="true" /></span><span><small>In transit or delivered</small><strong>{shipped}</strong></span></div>
        <div className={styles.valueStat}><span><small>Open order value</small><strong>{formatCurrency(openValue)}</strong></span><span className={styles.valueNote}>Not including completed or cancelled</span></div>
      </div>

      <section className={styles.orderPanel}>
        <div className={styles.panelHeading}>
          <div><h2>Order queue</h2><p>Choose an order to see its items and fulfilment details.</p></div>
          <span className={styles.count}>{filtered.length} {filtered.length === 1 ? "order" : "orders"}</span>
        </div>
        <div className={styles.filters}>
          <label className={styles.search}>
            <FiSearch aria-hidden="true" />
            <input aria-label="Search orders" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an order or customer" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><FiX aria-hidden="true" /></button>}
          </label>
          <label className={styles.select}><FiFilter aria-hidden="true" /><select aria-label="Filter orders by status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All orders</option>{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className={styles.select}><FiArrowDown aria-hidden="true" /><select aria-label="Sort orders" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest value</option><option value="lowest">Lowest value</option></select></label>
        </div>

        {filtered.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Items</th><th>Total</th><th>Status</th><th>Next step</th></tr></thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td><button className={styles.orderId} type="button" onClick={() => setViewing(order)}>{order.id}</button><small>{order.channel}</small></td>
                    <td><strong>{order.customer}</strong><small>{order.email}</small></td>
                    <td>{formatShortDate(order.placedAt)}</td>
                    <td>{order.items.reduce((total, item) => total + item.quantity, 0)} {order.items.reduce((total, item) => total + item.quantity, 0) === 1 ? "item" : "items"}</td>
                    <td className={styles.total}>{formatCurrency(order.total)}</td>
                    <td><span className={[styles.status, styles[order.status.toLowerCase().replaceAll(" ", "")]].join(" ")}><i />{order.status}</span></td>
                    <td>
                      {nextStatus[order.status] ? (
                        <button className={styles.advanceButton} type="button" onClick={() => changeStatus(order, nextStatus[order.status])}>
                          {nextStatus[order.status] === "Shipped" ? <FiTruck aria-hidden="true" /> : <FiArrowRight aria-hidden="true" />}
                          {nextStatus[order.status] === "Packing" ? "Start packing" : nextStatus[order.status] === "Ready to ship" ? "Mark ready" : nextStatus[order.status] === "Shipped" ? "Mark shipped" : "Complete"}
                        </button>
                      ) : order.status === "Delivered" ? <span className={styles.complete}><FiCheck aria-hidden="true" /> Complete</span> : <span className={styles.cancelledText}>Cancelled</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <span><FiShoppingBag aria-hidden="true" /></span>
            <h3>No orders match that view.</h3>
            <p>Try another customer, order number, or status.</p>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>

      {viewing && (
        <Modal isOpen title={"Order " + viewing.id} description={"Placed " + formatShortDate(viewing.placedAt) + " · " + viewing.channel} onClose={() => setViewing(null)}>
          <div className={styles.detailTop}>
            <div><small>Order total</small><strong>{formatCurrency(viewing.total)}</strong></div>
            <span className={[styles.status, styles[viewing.status.toLowerCase().replaceAll(" ", "")]].join(" ")}><i />{viewing.status}</span>
          </div>
          <div className={styles.customerCard}><span className={styles.customerInitial}>{viewing.customer.charAt(0)}</span><span><strong>{viewing.customer}</strong><small>{viewing.email}</small></span></div>
          <h3 className={styles.sectionTitle}>Items in this order</h3>
          <div className={styles.items}>
            {viewing.items.map((item) => <div key={item.name}><span>{item.name}</span><strong>× {item.quantity}</strong></div>)}
          </div>
          {nextStatus[viewing.status] ? (
            <button className={styles.detailAdvance} type="button" onClick={() => changeStatus(viewing, nextStatus[viewing.status])}>Move to {nextStatus[viewing.status]} <FiArrowRight aria-hidden="true" /></button>
          ) : <p className={styles.doneMessage}><FiCheck aria-hidden="true" /> {viewing.status === "Cancelled" ? "This order was cancelled." : "This order has been delivered."}</p>}
          {!["Delivered", "Cancelled"].includes(viewing.status) && <button className={styles.cancelOrder} type="button" onClick={() => setCancelling(viewing)}>Cancel this order</button>}
        </Modal>
      )}

      <ConfirmationDialog
        isOpen={Boolean(cancelling)}
        title="Cancel this order?"
        itemName={cancelling ? "Order " + cancelling.id + " for " + cancelling.customer : ""}
        description={cancelling ? "This order will move to Cancelled and be removed from the active fulfilment queue." : ""}
        confirmLabel="Cancel order"
        onCancel={() => setCancelling(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}

export default OrdersPage;