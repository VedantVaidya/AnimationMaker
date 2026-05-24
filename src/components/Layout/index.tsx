import React, { type ReactNode, useState, useEffect } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
    controllers: ReactNode;
    preview: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ controllers, preview }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div className={styles.container}>
            <aside className={`${styles.controllers} ${isFullscreen ? styles.hidden : ''}`}>
                {controllers}
            </aside>
            <main className={`${styles.preview} ${isFullscreen ? styles.previewFullscreen : ''}`}>
                {preview}
            </main>
        </div>
    );
};
