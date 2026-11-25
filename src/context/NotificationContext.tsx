
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type NotificationType = 'success' | 'error'

interface Notification {
  id: number
  type: NotificationType
  message: string
}

interface NotificationContextType {
  notifySuccess: (message: string) => void
  notifyError: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

function Toast({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: (id: number) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id)
    }, 4500)

    return () => clearTimeout(timer)
  }, [notification.id, onClose])

  const isSuccess = notification.type === 'success'

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border bg-white p-4 shadow-lg ${
        isSuccess ? 'border-green-200' : 'border-red-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="text-green-600 shrink-0" size={22} />
      ) : (
        <XCircle className="text-red-600 shrink-0" size={22} />
      )}

      <p className="flex-1 text-sm font-medium text-gray-800">
        {notification.message}
      </p>

      <button
        onClick={() => onClose(notification.id)}
        className="text-gray-400 hover:text-gray-700"
        aria-label="Cerrar notificación"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function NotificationProvider({
  children,
}: {
  children: ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: number) => {
    setNotifications(current => current.filter(item => item.id !== id))
  }, [])

  const notify = useCallback((type: NotificationType, message: string) => {
    setNotifications(current => [
      ...current,
      { id: Date.now() + Math.random(), type, message },
    ])
  }, [])

  const notifySuccess = useCallback(
    (message: string) => notify('success', message),
    [notify],
  )

  const notifyError = useCallback(
    (message: string) => notify('error', message),
    [notify],
  )

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError }}>
      {children}

      <div className="fixed right-5 top-5 z-[9999] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-3">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error(
      'useNotification debe utilizarse dentro de NotificationProvider',
    )
  }

  return context
}
