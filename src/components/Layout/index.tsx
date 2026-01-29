import React, { type ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
    controllers: ReactNode;
    preview: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ controllers, preview }) => {
    return (
        <div className={styles.container}>
            <aside className={styles.controllers}>
                {controllers}
            </aside>
            <main className={styles.preview}>
                {preview}
            </main>
        </div>
    );
};
