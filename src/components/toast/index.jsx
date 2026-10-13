import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const Icon = icons[toast.type] || icons.info;
  const iconClass = [styles.icon, styles[toast.type]].filter(Boolean).join(" ");

  return (
    <div className={styles.toast} role={toast.type === "error" ? "alert" : "status"} aria-live="polite">
      <span className={iconClass}><Icon aria-hidden="true" /></span>
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} type="button" onClick={onClose} aria-label="Dismiss notification"><FiX aria-hidden="true" /></button>
    </div>
  );
}

export default Toast;