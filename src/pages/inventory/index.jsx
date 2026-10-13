import { useMemo, useState } from "react";
import { FiArrowDown, FiBox, FiDownload, FiFilter, FiMinus, FiPlus, FiSearch, FiX } from "react-icons/fi";
import Modal from "../../components/modal";
import { formatCurrency, getStockLabel } from "../../data";
import styles from "./styles.module.css";

const stockFilters = ["All stock", "Needs attention", "Out of stock", "In range"];

function downloadStock(products) {
  const rows = [["Product", "SKU", "Category", "Available", "Low stock at", "Status"]];
  products.forEach((product) => rows.push([product.name, product.sku, product.category, product.stock, product.lowAt, getStockLabel(product)]));
  const csv = rows.map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "tandem-stock.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function InventoryPage({ products, onAdjustStock }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All stock");
  const [sort, setSort] = useState("attention");
  const [adjusting, setAdjusting] = useState(null);
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("add");
  const [reason, setReason] = useState("Restock received");
  const [error, setError] = useState("");

  const lowItems = products.filter((product) => product.stock <= product.lowAt);
  const stockValue = products.reduce((total, product) => total + product.stock * product.price, 0);
  const totalUnits = products.reduce((total, product) => total + product.stock, 0);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visible = products.filter((product) => {
      const matchesSearch = !term || [product.name, product.sku, product.category].some((value) => value.toLowerCase().includes(term));
      const matchesFilter = filter === "All stock"
        || (filter === "Needs attention" && product.stock > 0 && product.stock <= product.lowAt)
        || (filter === "Out of stock" && product.stock === 0)
        || (filter === "In range" && product.stock > product.lowAt);
      return matchesSearch && matchesFilter;
    });
    return visible.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "highest") return b.stock - a.stock;
      return a.stock - a.lowAt - (b.stock - b.lowAt);
    });
  }, [filter, products, query, sort]);

  const beginAdjust = (product, mode = "add") => {
    setAdjusting(product);
    setAmount("");
    setDirection(mode);
    setReason(mode === "add" ? "Restock received" : "Damaged or missing");
    setError("");
  };

  const closeAdjust = () => {
    setAdjusting(null);
    setError("");
  };

  const submitAdjustment = (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1) {
      setError("Enter a whole number greater than zero.");
      return;
    }
    if (direction === "remove" && value > adjusting.stock) {
      setError("You cannot remove more than the " + adjusting.stock + " units currently available.");
      return;
    }
    onAdjustStock(adjusting.id, direction === "add" ? value : -value, reason);
    closeAdjust();
  };

  const clearFilters = () => {
    setQuery("");
    setFilter("All stock");
    setSort("attention");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div><p className={styles.context}>STOCKROOM</p><h1>Inventory</h1><p className={styles.subtitle}>Know what is ready to ship and what needs a restock.</p></div>
        <button className={styles.exportButton} type="button" onClick={() => downloadStock(rows)}><FiDownload aria-hidden="true" /> Download stock sheet</button>
      </div>

      <div className={styles.inventoryBanner}>
        <div className={styles.bannerCopy}><span className={styles.bannerLabel}>ON HAND RIGHT NOW</span><strong>{totalUnits.toLocaleString()}<small> units</small></strong><p>Across {products.length} catalog listings</p></div>
        <div className={styles.bannerValue}><span>Catalog value</span><strong>{formatCurrency(stockValue)}</strong><small>Using current listing prices</small></div>
        <div className={styles.bannerAttention}><span className={styles.alertIcon}><FiBox aria-hidden="true" /></span><span><small>Below stock point</small><strong>{lowItems.length} {lowItems.length === 1 ? "listing" : "listings"}</strong></span><span className={styles.bannerArrow}>›</span></div>
      </div>

      <section className={styles.stockPanel}>
        <div className={styles.panelHeading}>
          <div><h2>Stock by listing</h2><p>Make a quick adjustment when new units arrive or stock changes.</p></div>
          <span className={styles.count}>{rows.length} {rows.length === 1 ? "product" : "products"}</span>
        </div>
        <div className={styles.filters}>
          <label className={styles.search}><FiSearch aria-hidden="true" /><input aria-label="Search inventory" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product or SKU" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><FiX aria-hidden="true" /></button>}</label>
          <label className={styles.select}><FiFilter aria-hidden="true" /><select aria-label="Filter inventory" value={filter} onChange={(event) => setFilter(event.target.value)}>{stockFilters.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className={styles.select}><FiArrowDown aria-hidden="true" /><select aria-label="Sort inventory" value={sort} onChange={(event) => setSort(event.target.value)}><option value="attention">Closest to low-stock point</option><option value="name">Product name</option><option value="highest">Most units</option></select></label>
        </div>

        {rows.length ? (
          <div className={styles.stockList}>
            <div className={styles.stockLabels}><span>Listing</span><span>Available</span><span>Stock level</span><span>Low-stock point</span><span>Adjust</span></div>
            {rows.map((product) => {
              const stockLabel = getStockLabel(product);
              const ratio = Math.min(100, product.lowAt > 0 ? (product.stock / (product.lowAt * 2)) * 100 : 100);
              return (
                <article className={styles.stockRow} key={product.id}>
                  <div className={styles.listing}>
                    <span className={styles.productIcon}><FiBox aria-hidden="true" /></span>
                    <span><strong>{product.name}</strong><small>{product.sku} · {product.category}</small></span>
                  </div>
                  <strong className={[styles.units, product.stock <= product.lowAt ? styles.low : ""].join(" ")}>{product.stock}<small>{stockLabel}</small></strong>
                  <div className={styles.level}>
                    <div className={styles.progress}><span className={product.stock <= product.lowAt ? styles.lowBar : ""} style={{ width: ratio + "%" }} /></div>
                    <span>{product.stock === 0 ? "No units available" : product.stock <= product.lowAt ? "Restock soon" : "In a good range"}</span>
                  </div>
                  <span className={styles.threshold}>{product.lowAt} units</span>
                  <div className={styles.adjustActions}>
                    <button className={styles.addStock} type="button" onClick={() => beginAdjust(product, "add")}><FiPlus aria-hidden="true" /> Restock</button>
                    <button className={styles.removeStock} type="button" onClick={() => beginAdjust(product, "remove")} disabled={product.stock === 0} aria-label={"Reduce stock for " + product.name}><FiMinus aria-hidden="true" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <span><FiBox aria-hidden="true" /></span><h3>No stock matches this view.</h3><p>Try a different product name or clear the stock filters.</p><button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>

      {adjusting && (
        <Modal isOpen title={direction === "add" ? "Add stock" : "Reduce stock"} description={adjusting.name + " · " + adjusting.stock + " units currently available"} onClose={closeAdjust} size="small">
          <form className={styles.adjustForm} onSubmit={submitAdjustment} noValidate>
            <label className={styles.quantityField}><span>Number of units</span><input autoFocus type="number" min="1" step="1" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} placeholder="e.g. 12" aria-invalid={Boolean(error)} /></label>
            {direction === "remove" && <label className={styles.quantityField}><span>Reason</span><select value={reason} onChange={(event) => setReason(event.target.value)}><option>Damaged or missing</option><option>Quality check</option><option>Stock correction</option></select></label>}
            {direction === "add" && <p className={styles.adjustHint}>New stock will be added to the current available units.</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.formActions}><button className={styles.cancelButton} type="button" onClick={closeAdjust}>Cancel</button><button className={styles.submitButton} type="submit">{direction === "add" ? "Add units" : "Reduce units"}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default InventoryPage;