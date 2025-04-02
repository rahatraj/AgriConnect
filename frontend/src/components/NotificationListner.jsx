import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import {
    addNotification,
    markAsRead,
    markAllRead,
    clearNotification,
} from "../redux/slices/NotificationSlice";

function NotificationListener() {
    const socket = useSelector((state) => state.socket.instance);
    const dispatch = useDispatch();

    // Notifications & unread count from Redux
    const notifications = useSelector((state) => state.notifications?.notifications || []);
    const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Handle new real-time notifications
    const handleNotification = useCallback((data) => {
        console.log("New notification received:", data);
        dispatch(addNotification(data));
        toast.success(data.message);
    }, [dispatch]);

    // Attach & detach socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on("notification", handleNotification);

        return () => {
            socket.off("notification", handleNotification);
        };
    }, [socket, handleNotification]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Mark notifications as read when opening dropdown
    const handleOpenNotifications = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            dispatch(markAsRead());
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Button */}
            <button
                onClick={handleOpenNotifications}
                className="relative px-4 py-1 text-sm rounded flex items-center gap-2 hover:bg-gray-200 transition"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification List Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-5 w-64 bg-white shadow-lg rounded-lg border z-10">
                    {notifications.length === 0 ? (
                        <div className="p-3 text-gray-500 text-sm">No new notifications</div>
                    ) : (
                        <>
                            <div className="p-2 border-b flex justify-between items-center">
                                <span className="font-semibold text-sm">Notifications</span>
                                <div>
                                    <button
                                        className="text-xs text-blue-500 hover:underline mr-2"
                                        onClick={() => dispatch(markAllRead())}
                                    >
                                        Mark all as read
                                    </button>
                                    <button
                                        className="text-xs text-red-500 hover:underline"
                                        onClick={() => dispatch(clearNotification())}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map((note) => (
                                    <div key={note.id} className="p-3 border-b last:border-none text-sm">
                                        {note.message}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationListener;
