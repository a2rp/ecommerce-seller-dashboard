import { useRef, useState } from "react";
import { FiPackage } from "react-icons/fi";
import Modal from "../modal";
import styles from "./styles.module.css";

const categories = ["Accessories", "Bath", "Coffee", "Home", "Kitchen", "Pantry", "Stationery", "Tableware"];

function ProductForm({ product, onSave, onClose }) {
  const nameRef = useRef(null);
  const [values, setValues] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    category: product?.category || "Home",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    lowAt: product?.lowAt ?? 8,
    status: product?.status || "Active",
    description: product?.description || "",
  });
  const [errors, setErrors] = useState({});

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (values.name.trim().length < 3) nextErrors.name = "Enter a product name with at least 3 characters.";
    if (values.sku.trim().length < 3) nextErrors.sku = "Enter a SKU with at least 3 characters.";
    if (!categories.includes(values.category)) nextErrors.category = "Choose a product category.";
    if (!Number.isFinite(Number(values.price)) || Number(values.price) <= 0) nextErrors.price = "Price must be greater than zero.";
    if (!Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) nextErrors.stock = "Stock must be a whole number of 0 or more.";
    if (!Number.isInteger(Number(values.lowAt)) || Number(values.lowAt) < 0) nextErrors.lowAt = "The low-stock point must be 0 or more.";
    if (values.description.trim().length < 12) nextErrors.description = "Add a short description with at least 12 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave({
      ...values,
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      description: values.description.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      lowAt: Number(values.lowAt),
      status: values.status,
    });
  };

  return (
    <Modal
      isOpen
      title={product ? "Edit listing" : "Add a product"}
      description={product ? "Update the listing details in your catalog." : "Create a new listing for your store."}
      onClose={onClose}
      initialFocusRef={nameRef}
      size="large"
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.formLead}><span><FiPackage aria-hidden="true" /></span><p>Keep the product details and stock level up to date.</p></div>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Product name</span>
            <input ref={nameRef} name="name" value={values.name} onChange={update} placeholder="e.g. Everyday market tote" autoComplete="off" aria-invalid={Boolean(errors.name)} />
            {errors.name && <small className={styles.error}>{errors.name}</small>}
          </label>
          <label className={styles.field}>
            <span>SKU</span>
            <input name="sku" value={values.sku} onChange={update} placeholder="e.g. BAG-042" autoComplete="off" aria-invalid={Boolean(errors.sku)} />
            {errors.sku && <small className={styles.error}>{errors.sku}</small>}
          </label>
          <label className={styles.field}>
            <span>Category</span>
            <select name="category" value={values.category} onChange={update} aria-invalid={Boolean(errors.category)}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            {errors.category && <small className={styles.error}>{errors.category}</small>}
          </label>
          <label className={styles.field}>
            <span>Price</span>
            <div className={styles.numberInput}><span>$</span><input type="number" min="0.01" step="0.01" name="price" value={values.price} onChange={update} placeholder="0.00" aria-invalid={Boolean(errors.price)} /></div>
            {errors.price && <small className={styles.error}>{errors.price}</small>}
          </label>
          <label className={styles.field}>
            <span>Units in stock</span>
            <input type="number" min="0" step="1" name="stock" value={values.stock} onChange={update} placeholder="0" aria-invalid={Boolean(errors.stock)} />
            {errors.stock && <small className={styles.error}>{errors.stock}</small>}
          </label>
          <label className={styles.field}>
            <span>Low-stock alert at</span>
            <input type="number" min="0" step="1" name="lowAt" value={values.lowAt} onChange={update} aria-invalid={Boolean(errors.lowAt)} />
            {errors.lowAt && <small className={styles.error}>{errors.lowAt}</small>}
          </label>
          <label className={styles.field}>
            <span>Listing status</span>
            <select name="status" value={values.status} onChange={update}>
              <option>Active</option>
              <option>Draft</option>
              <option>Paused</option>
            </select>
          </label>
          <label className={[styles.field, styles.fullWidth].join(" ")}>
            <span>Product description</span>
            <textarea name="description" rows="3" value={values.description} onChange={update} placeholder="A short note about what makes this product useful." aria-invalid={Boolean(errors.description)} />
            {errors.description && <small className={styles.error}>{errors.description}</small>}
          </label>
        </div>
        <div className={styles.actions}>
          <button className={styles.cancel} type="button" onClick={onClose}>Cancel</button>
          <button className={styles.save} type="submit">{product ? "Save changes" : "Add product"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductForm;