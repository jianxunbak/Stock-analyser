import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './UserProfileModal.module.css';
import ThemeToggle from './ThemeToggle';

const UserProfileModal = ({ isOpen, onClose, user }) => {

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>User Profile</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatar} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '2.5rem',
                            fontWeight: 'bold'
                        }}>
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}

                    <div className={styles.userInfo}>
                        <h3 className={styles.userName}>{user.displayName || 'User'}</h3>
                        <p className={styles.userEmail}>{user.email}</p>
                    </div>

                    <div className={styles.themeSection}>
                        <span>Appearance:</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
