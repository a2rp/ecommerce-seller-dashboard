import { FiArrowUpRight, FiCommand } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import styles from "./styles.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerNote}><FiCommand aria-hidden="true" /> Seller preview · Sample store data</span>
      <a
        className={styles.creatorLink}
        href="https://www.ashishranjan.net"
        target="_blank"
        rel="noreferrer"
        data-tooltip-id="creator-tooltip"
        data-tooltip-content="Portfolio · ashishranjan.net"
      >
        <img src={import.meta.env.BASE_URL + "logo.png"} alt="" />
        <span>Built by <strong>Ashish Ranjan</strong></span>
        <FiArrowUpRight aria-hidden="true" />
      </a>
      <Tooltip id="creator-tooltip" place="top" className={styles.tooltip} />
    </footer>
  );
}

export default Footer;