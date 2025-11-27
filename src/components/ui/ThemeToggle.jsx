import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.toggleButton}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className={styles.icon} />
            ) : (
                <Moon size={20} className={styles.icon} />
            )}
        </button>
    );
};

export default ThemeToggle;
