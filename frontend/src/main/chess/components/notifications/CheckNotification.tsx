import { useEffect, useState } from 'react';
import './CheckNotification.css';

interface CheckNotificationProps {
    isVisible: boolean;
    message: string;
    onClose: () => void;
}

export const CheckNotification = ({ isVisible, message, onClose }: CheckNotificationProps) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            // Auto-close after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            // Allow time for exit animation before removing from DOM
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!shouldRender) return null;

    return (
        <div className={`check-notification ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="notification-content">
                <div className="notification-icon">⚠️</div>
                <div className="notification-message">{message}</div>
                <button className="notification-close" onClick={onClose}>
                    ✕
                </button>
            </div>
        </div>
    );
};