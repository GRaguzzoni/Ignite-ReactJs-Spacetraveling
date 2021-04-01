import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <header className={styles.container}>  
        <div className={styles.content}>
          <img src="/Logo.svg" alt="logo" />        
        </div>    
      </header>
    </Link>
  )
}
