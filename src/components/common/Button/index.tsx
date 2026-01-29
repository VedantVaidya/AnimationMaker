import React, { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'default',
    fullWidth = false,
    className,
    style,
    ...props
}) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${className || ''}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                ...style
            }}
            {...props}
        >
            {children}
        </button>
    );
};
