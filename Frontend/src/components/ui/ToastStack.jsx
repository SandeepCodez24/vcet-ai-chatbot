import clsx from 'clsx'
import { useToastStore } from '../../store/toastStore'
import styles from './ToastStack.module.css'

/** Global toast queue, rendered once near the app root. Push via useToastStore.getState().push(). */
const ToastStack = () => {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(styles.toast, t.type === 'error' && styles.error, t.type === 'success' && styles.success)}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default ToastStack
