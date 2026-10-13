import styles from "./styles.module.css";

function Loading() {
  return <div className={styles.loading} role="status" aria-label="Loading page"><span /></div>;
}

export default Loading;