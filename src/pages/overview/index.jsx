import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBox,
  FiCheck,
  FiChevronRight,
  FiCoffee,
  FiDroplet,
  FiHome,
  FiPackage,
  FiPlus,
  FiShoppingBag,
  FiSun,
} from "react-icons/fi";
import { formatCurrency, getStockLabel } from "../../data";
import styles from "./styles.module.css";

const productIcons = {
  coffee: FiCoffee,
  bag: FiShoppingBag,
  candle: FiSun,
  cup: FiCoffee,
  book: FiBox,
  tea: FiCoffee,
  soap: FiDroplet,
  apron: FiHome,
  woven: FiHome,
  bowl: FiHome,
  box: FiPackage,
};

function makeSeries(orders, range) {
  const groups = range === "week" ? 7 : 4;
  return Array.from({ length: groups }, (_, index) => {
    const date = new Date();
    const offset = range === "week" ? index - (groups - 1) : (index - (groups - 1)) * 7;
    date.setDate(date.getDate() + offset);
    const key = date.toDateString();
    const amount = orders
      .filter((order) => {
        if (order.status === "Cancelled") return false;
        const orderDate = new Date(order.placedAt);
        return range === "week"
          ? orderDate.toDateString() === key
          : Math.abs(Math.floor((date.getTime() - orderDate.getTime()) / 86400000)) < 7;
      })
      .reduce((total, order) => total + order.total, 0);
    return {
      label: range === "week" ? date.toLocaleDateString("en-US", { weekday: "short" }) : "Week " + (index + 1),
      amount,
    };
  });
}

function OverviewPage({ products, orders }) {
  const [range, setRange] = useState("week");
  const navigate = useNavigate();
  const sales = orders.filter((order) => order.status !== "Cancelled").reduce((total, order) => total + order.total, 0);
  const openOrders = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status));
  const activeProducts = products.filter((product) => product.status === "Active");
  const inventoryTotal = products.reduce((total, product) => total + product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= product.lowAt);
  const leaders = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  const recentOrders = [...orders].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)).slice(0, 4);
  const series = useMemo(() => makeSeries(orders, range), [orders, range]);
  const maxBar = Math.max(...series.map((item) => item.amount), 1);

  const addProduct = () => navigate("/products", { state: { openCreate: true } });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.date}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1>Your store, in a good place.</h1>
          <p className={styles.subtitle}>A clear view of the details that keep Harbor Goods moving.</p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={addProduct}><FiPlus aria-hidden="true" /> Add a product</button>
      </div>

      <section className={styles.welcomeCard} aria-label="Store summary">
        <div className={styles.welcomeCopy}>
          <span className={styles.welcomeLabel}><span /> YOUR SHOP TODAY</span>
          <h2>A good day to grow.</h2>
          <p>Keep orders moving and your best-loved products in stock.</p>
          <button className={styles.welcomeButton} type="button" onClick={() => navigate("/orders")}>Open order desk <FiArrowRight aria-hidden="true" /></button>
        </div>
        <div className={styles.welcomeNumbers}>
          <div><span>Store sales</span><strong>{formatCurrency(sales)}</strong><small>Across active demo orders</small></div>
          <div><span>Orders in motion</span><strong>{openOrders.length.toString().padStart(2, "0")}</strong><small>Need a next step</small></div>
          <div><span>Units on hand</span><strong>{inventoryTotal}</strong><small>{lowStock.length} listings need a check</small></div>
        </div>
        <span className={styles.welcomeOrb} aria-hidden="true" />
      </section>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}><span className={styles.summaryIcon}><FiShoppingBag aria-hidden="true" /></span><div><small>Orders to prepare</small><strong>{orders.filter((order) => ["New", "Packing"].includes(order.status)).length}</strong></div><span className={styles.summaryNote}>New + packing</span></article>
        <article className={styles.summaryCard}><span className={styles.summaryIcon}><FiBox aria-hidden="true" /></span><div><small>Active listings</small><strong>{activeProducts.length}</strong></div><span className={styles.summaryNote}>Ready for shoppers</span></article>
        <article className={styles.summaryCard}><span className={[styles.summaryIcon, styles.warnIcon].join(" ")}><FiPackage aria-hidden="true" /></span><div><small>Low stock</small><strong>{lowStock.length}</strong></div><span className={styles.summaryNote}>{lowStock.length ? "Restock a few favorites" : "Stock looks good"}</span></article>
        <article className={styles.summaryCard}><span className={[styles.summaryIcon, styles.goodIcon].join(" ")}><FiCheck aria-hidden="true" /></span><div><small>Delivered</small><strong>{orders.filter((order) => order.status === "Delivered").length}</strong></div><span className={styles.summaryNote}>Customer orders complete</span></article>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div><h2>Sales at a glance</h2><p>Order value from your recent shop activity.</p></div>
            <div className={styles.rangeButtons} aria-label="Choose sales period">
              <button type="button" className={range === "week" ? styles.selectedRange : ""} onClick={() => setRange("week")}>7 days</button>
              <button type="button" className={range === "month" ? styles.selectedRange : ""} onClick={() => setRange("month")}>4 weeks</button>
            </div>
          </div>
          <div className={styles.salesTotal}><strong>{formatCurrency(sales)}</strong><span><FiArrowUpRight aria-hidden="true" /> Recent orders</span></div>
          <div className={[styles.chart, range === "month" ? styles.monthChart : ""].join(" ")} role="img" aria-label={range === "week" ? "Order sales over the past seven days" : "Order sales over the past four weeks"}>
            {series.map((item, index) => {
              const height = item.amount ? Math.max((item.amount / maxBar) * 100, 9) : 4;
              return (
                <div className={styles.chartColumn} key={item.label + index}>
                  <span className={styles.barValue}>{item.amount ? formatCurrency(item.amount) : ""}</span>
                  <div className={styles.barTrack}><span className={index === series.length - 1 ? styles.barCurrent : styles.bar} style={{ height: height + "%" }} /></div>
                  <span className={styles.barLabel}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div><h2>Today’s order desk</h2><p>Pick up where your shoppers left off.</p></div>
            <button className={styles.iconButton} type="button" onClick={() => navigate("/orders")} aria-label="Open all orders"><FiArrowUpRight aria-hidden="true" /></button>
          </div>
          <div className={styles.orderList}>
            {recentOrders.slice(0, 3).map((order) => (
              <button className={styles.orderRow} type="button" key={order.id} onClick={() => navigate("/orders")}>
                <span className={styles.orderGlyph}><FiShoppingBag aria-hidden="true" /></span>
                <span className={styles.orderInfo}><strong>{order.customer}</strong><small>{order.id} · {order.items.length} {order.items.length === 1 ? "item" : "items"}</small></span>
                <span className={[styles.status, styles[order.status.toLowerCase().replaceAll(" ", "")]].join(" ")}>{order.status}</span>
                <FiChevronRight className={styles.rowArrow} aria-hidden="true" />
              </button>
            ))}
          </div>
          <button className={styles.textLink} type="button" onClick={() => navigate("/orders")}>See every order <FiArrowRight aria-hidden="true" /></button>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div><h2>Customer favorites</h2><p>Your most-loved listings by units sold.</p></div>
            <button className={styles.iconButton} type="button" onClick={() => navigate("/products")} aria-label="Open all listings"><FiArrowUpRight aria-hidden="true" /></button>
          </div>
          <div className={styles.favoriteList}>
            {leaders.map((product, index) => {
              const Icon = productIcons[product.icon] || FiPackage;
              return (
                <button className={styles.favoriteRow} key={product.id} type="button" onClick={() => navigate("/products")}>
                  <span className={styles.rank}>0{index + 1}</span>
                  <span className={styles.productGlyph}><Icon aria-hidden="true" /></span>
                  <span className={styles.productInfo}><strong>{product.name}</strong><small>{product.category} · {formatCurrency(product.price)}</small></span>
                  <span className={styles.unitsSold}>{product.sold}<small>sold</small></span>
                </button>
              );
            })}
          </div>
          <button className={styles.textLink} type="button" onClick={() => navigate("/products")}>Manage listings <FiArrowRight aria-hidden="true" /></button>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div><h2>Stock to check</h2><p>Small restocks can keep a good week on track.</p></div>
            <button className={styles.iconButton} type="button" onClick={() => navigate("/inventory")} aria-label="Open inventory"><FiArrowUpRight aria-hidden="true" /></button>
          </div>
          <div className={styles.stockList}>
            {lowStock.slice(0, 3).map((product) => {
              const Icon = productIcons[product.icon] || FiPackage;
              return (
                <button className={styles.stockRow} key={product.id} type="button" onClick={() => navigate("/inventory")}>
                  <span className={styles.productGlyph}><Icon aria-hidden="true" /></span>
                  <span className={styles.productInfo}><strong>{product.name}</strong><small>{product.sku} · {getStockLabel(product)}</small></span>
                  <span className={styles.stockCount}>{product.stock}<small>left</small></span>
                </button>
              );
            })}
            {!lowStock.length && <div className={styles.emptyStock}><FiCheck aria-hidden="true" /><span>Everything is above its low-stock point.</span></div>}
          </div>
          <button className={styles.textLink} type="button" onClick={() => navigate("/inventory")}>Review stock <FiArrowRight aria-hidden="true" /></button>
        </section>
      </div>
    </div>
  );
}

export default OverviewPage;