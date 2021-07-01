import Link from 'next/link'
import style from './exitBtn.module.scss'

export function ExitPreviewButton() {
  return (
    <button type="button" className={style.exitBtn}>      
        <Link href="/api/exit-preview" >Exit Preview</Link>
    </button>
  )
}