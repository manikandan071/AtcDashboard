import * as React from "react";
import styles from "./CustomLoader.module.scss";
const CustomLoader = () => {
  return (
    <div className={styles.Overlay}>
      <div className={styles.wrapper}>
        <div className={styles.loader}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
export default CustomLoader;
