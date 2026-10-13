import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowDownWideNarrow,
  FiBox,
  FiCoffee,
  FiDroplet,
  FiEdit2,
  FiEye,
  FiFilter,
  FiHome,
  FiPackage,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import ConfirmationDialog from "../../components/confirmationDialog";
import ProductForm from "../../components/productForm";
import Modal from "../../components/modal";
import { formatCurrency, getStockLabel } from "../../data";
import styles from "./styles.module.css";

const icons = { coffee: FiCoffee, bag: FiShoppingBag, candle: FiSun, cup: FiCoffee, book: FiBox, tea: FiCoffee, soap: FiDroplet, apron: FiHome, woven: FiHome, bowl: FiHome, box: FiPackage };
const statuses = ["All listings", "Active", "Draft", "Paused"];

function ProductsPage({ products, onSaveProduct, onDeleteProduct }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All listings");
  const [sort, setSort] = useState("popular");
  const [formOpen, setFormOpen] = useState(Boolean(location.state?.openCreate));
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = products.filter((product) => {
      const matchesSearch = !query || [product.name, product.sku, product.category, product.description].some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (status === "All listings" || product.status === status);
    });
    return rows.sort((a, b) => {
      if (sort === "stock") return a.stock - b.stock;
      if (sort === "priceLow") return a.price - b.price;
      if (sort === "priceHigh") return b.price - a.price;
      if (sort === "recent") return products.indexOf(b) - products.indexOf(a);
      return b.sold - a.sold;
    });
  }, [products, search, sort, status]);

  const activeCount = products.filter((product) => product.status === "Active").length;
  const stockValue = products.reduce((total, product) => total + product.price * product.stock, 0);
  const lowCount = products.filter((product) => product.stock <= product.lowAt).length;

  const openEdit = (product) => {
    setViewing(null);
    setEditing(product);
    setFormOpen(true);
  };

  const save = (values) => {
    onSaveProduct(values, editing?.id);
    setFormOpen(false);
    setEditing(null);
  };

  const confirmRemoval = () => {
    if (removing) onDeleteProduct(removing.id);
    setRemoving(null);
    if (viewing?.id === removing?.id) setViewing(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("All listings");
    setSort("popular");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div><p className={styles.context}>YOUR CATALOG</p><h1>Products</h1><p className={styles.subtitle}>Shape the listings shoppers find in your store.</p></div>
        <button className={styles.primaryButton} type="button" onClick={() => { setEditing(null); setFormOpen(true); }}><FiPlus aria-hidden="true" /> Add a product</button>
      </div>

      <div className={styles.statStrip}>
        <div><span>All listings</span><strong>{products.length}</strong><small>Across {new Set(products.map((product) => product.category)).size} categories</small></div>
        <div><span>Active now</span><strong>{activeCount}</strong><small>Available in your shop</small></div>
        <div><span>Stock value</span><strong>{formatCurrency(stockValue)}</strong><small>Current listed price × units</small></div>
        <div className={styles.alertStat}><span>Stock alerts</span><strong>{lowCount}</strong><small>At or below your stock point</small></div>
      </div>

      <section className={styles.catalogPanel}>
        <div className={styles.catalogHeading}>
          <div><h2>Store catalog</h2><p>Update product details and keep each listing in shape.</p></div>
          <span className={styles.catalogCount}>{filtered.length} {filtered.length === 1 ? "listing" : "listings"}</span>
        </div>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <FiSearch aria-hidden="true" />
            <input aria-label="Search listings" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, or category" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><FiX aria-hidden="true" /></button>}
          </label>
          <label className={styles.selectField}><FiFilter aria-hidden="true" /><select aria-label="Filter listings by status" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className={styles.selectField}><FiArrowDownWideNarrow aria-hidden="true" /><select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Most sold</option><option value="recent">Recently added</option><option value="stock">Lowest stock</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option></select></label>
        </div>

        {filtered.length ? (
          <div className={styles.productList}>
            <div className={styles.columnLabels}><span>Product</span><span>Price</span><span>Stock</span><span>Units sold</span><span>Status</span><span>Actions</span></div>
            {filtered.map((product) => {
              const Icon = icons[product.icon] || FiPackage;
              const stockLabel = getStockLabel(product);
              return (
                <article className={styles.productRow} key={product.id}>
                  <button className={styles.productCell} type="button" onClick={() => setViewing(product)}>
                    <span className={[styles.productIcon, styles[product.icon] || ""].join(" ")}><Icon aria-hidden="true" /></span>
                    <span className={styles.productName}><strong>{product.name}</strong><small>{product.sku} · {product.category}</small></span>
                  </button>
                  <span className={styles.price}>{formatCurrency(product.price)}</span>
                  <span className={[styles.stock, product.stock <= product.lowAt ? styles.lowStock : ""].join(" ")}>{product.stock}<small>{stockLabel}</small></span>
                  <span className={styles.sold}>{product.sold}</span>
                  <span className={[styles.state, styles[product.status.toLowerCase()]].join(" ")}><i />{product.status}</span>
                  <span className={styles.rowActions}>
                    <button type="button" aria-label={"View " + product.name} title="View listing" onClick={() => setViewing(product)}><FiEye aria-hidden="true" /></button>
                    <button type="button" aria-label={"Edit " + product.name} title="Edit listing" onClick={() => openEdit(product)}><FiEdit2 aria-hidden="true" /></button>
                    <button className={styles.deleteAction} type="button" aria-label={"Delete " + product.name} title="Delete listing" onClick={() => setRemoving(product)}><FiTrash2 aria-hidden="true" /></button>
                  </span>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span><FiPackage aria-hidden="true" /></span>
            <h3>No listings match that search.</h3>
            <p>Try a different name or clear your filters to see the whole catalog.</p>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>

      {formOpen && <ProductForm key={editing?.id || "new-listing"} product={editing} onSave={save} onClose={() => { setFormOpen(false); setEditing(null); }} />}

      {viewing && (
        <Modal isOpen title={viewing.name} description={viewing.sku + " · " + viewing.category} onClose={() => setViewing(null)} size="medium">
          <div className={styles.detailCard}>
            <span className={[styles.detailIcon, styles[viewing.icon] || ""].join(" ")}>{(() => { const Icon = icons[viewing.icon] || FiPackage; return <Icon aria-hidden="true" />; })()}</span>
            <div><strong>{formatCurrency(viewing.price)}</strong><small>Current listing price</small></div>
            <span className={[styles.state, styles[viewing.status.toLowerCase()]].join(" ")}><i />{viewing.status}</span>
          </div>
          <p className={styles.description}>{viewing.description}</p>
          <div className={styles.detailStats}><div><span>Available units</span><strong>{viewing.stock}</strong></div><div><span>Low-stock point</span><strong>{viewing.lowAt}</strong></div><div><span>Units sold</span><strong>{viewing.sold}</strong></div></div>
          <div className={styles.detailActions}><button type="button" onClick={() => openEdit(viewing)}><FiEdit2 aria-hidden="true" /> Edit listing</button><button type="button" onClick={() => { setViewing(null); navigate("/inventory"); }}><FiBox aria-hidden="true" /> Adjust stock</button></div>
        </Modal>
      )}

      <ConfirmationDialog isOpen={Boolean(removing)} title="Remove this listing?" itemName={removing?.name} description={removing ? removing.name + " will be removed from your store catalog. You can add it again later, but this listing will be deleted from the current demo." : ""} confirmLabel="Remove listing" onCancel={() => setRemoving(null)} onConfirm={confirmRemoval} />
    </div>
  );
}

export default ProductsPage;