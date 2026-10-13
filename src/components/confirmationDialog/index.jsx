import { useRef } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Modal from "../modal";
import styles from "./styles.module.css";

function ConfirmationDialog({
  isOpen,
  title = "Remove this item?",
  description,
  itemName,
  confirmLabel = "Remove",
  cancelLabel = "Keep it",
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const message = description || "This item will be removed from the current demo.";

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      describedBy="confirmation-description"
      onClose={onCancel}
      initialFocusRef={cancelRef}
      size="small"
    >
      <div className={styles.body}>
        <span className={styles.icon}><FiAlertTriangle aria-hidden="true" /></span>
        <div>
          <strong>{itemName || "Please confirm this change"}</strong>
          <p id="confirmation-description">{message}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.cancel} type="button" ref={cancelRef} onClick={onCancel}>{cancelLabel}</button>
        <button className={styles.confirm} type="button" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export default ConfirmationDialog;