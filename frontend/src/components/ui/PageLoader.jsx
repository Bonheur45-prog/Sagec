import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.wrapper} aria-label="Loading page">
      <div className={styles.logo}>
        <span className={styles.logoText}>SAGEC</span>
        <div className={styles.bar} />
      </div>
    </div>
  )
}
