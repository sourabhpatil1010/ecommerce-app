import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { notificationsApi } from "@/api";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications(0, 10);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        data-testid="notification-btn"
        className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
        aria-label="View Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-2xl z-50 animate-fade-in-down overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="text-sm font-semibold text-black dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-black dark:text-white bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    data-testid="notification-item"
                    className={`p-4 transition-colors ${n.is_read ? 'bg-white dark:bg-black opacity-70' : 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${n.is_read ? 'text-gray-600 dark:text-gray-400 font-normal' : 'text-black dark:text-white font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {n.message}
                        </p>
                        <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          data-testid="mark-read-btn"
                          className="shrink-0 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline self-start"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
