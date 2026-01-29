import React, { useRef, useEffect } from 'react';
import { useImageContext } from '../../context/ImageContext';
import type { TransformState } from '../../types';

interface ObjectManipulatorProps {
    id: string;
    src: string;
    state: TransformState;
}

export const ObjectManipulator: React.FC<ObjectManipulatorProps> = ({ id, src, state }) => {
    const { selectedImageId, selectImage, updateImageState, isPlaying, currentDuration } = useImageContext();
    const isSelected = selectedImageId === id;
    const isDragging = useRef(false);
    const isResizing = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectImage(id);
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - state.x,
            y: e.clientY - state.y,
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        isResizing.current = true;
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            width: state.width,
            height: state.height,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                updateImageState(id, {
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y,
                });
            } else if (isResizing.current) {
                const deltaX = e.clientX - resizeStart.current.x;
                const deltaY = e.clientY - resizeStart.current.y;

                // User requirement: Default = Preserve Aspect Ratio. 
                // Hold Cmd (Meta) or Alt to Free Resize.
                const isFreeResize = e.metaKey || e.altKey;

                let newWidth = Math.max(20, resizeStart.current.width + deltaX);
                let newHeight = Math.max(20, resizeStart.current.height + deltaY);

                if (!isFreeResize) {
                    // Lock aspect ratio
                    const ratio = resizeStart.current.width / resizeStart.current.height;
                    // We can simply take the larger delta or just X to drive Y?
                    // Let's use the width to drive height for simplicity or max change
                    newHeight = newWidth / ratio;
                }

                updateImageState(id, {
                    width: newWidth,
                    height: newHeight,
                });
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            isResizing.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [id, updateImageState]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                left: state.x,
                top: state.y,
                width: state.width,
                height: state.height,
                transform: `rotate(${state.rotation}deg) scale(${state.scaleX}, ${state.scaleY})`,
                zIndex: state.zIndex,
                clipPath: state.crop
                    ? `inset(${state.crop.top}% ${state.crop.right}% ${state.crop.bottom}% ${state.crop.left}%)`
                    : 'none',
                transition: isPlaying ? 'all 3s linear' : 'none', // Add transition
                cursor: isDragging.current ? 'grabbing' : 'grab',
                border: isSelected ? '2px solid #00a8ff' : 'none',
                boxSizing: 'border-box',
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
        >
            <img
                src={src}
                alt={`manipulable-object-${id}`}
                style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
                draggable={false}
            />
            {
                isSelected && (
                    <>
                        {/* Resize Handle (Bottom-Right) */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                width: 10,
                                height: 10,
                                backgroundColor: '#00a8ff',
                                borderRadius: '50%',
                                cursor: 'nwse-resize',
                            }}
                            onMouseDown={handleResizeStart}
                        />
                    </>
                )
            }
        </div >
    );
};
