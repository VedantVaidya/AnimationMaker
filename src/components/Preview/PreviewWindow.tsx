import React from 'react';
import { useImageContext } from '../../context/ImageContext';
import { ObjectManipulator } from '../Manipulator/ObjectManipulator';

export const PreviewWindow: React.FC = () => {
    const { images, imageStates, selectImage } = useImageContext();

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => selectImage(null)} // Deselect when clicking background
        >
            {images.map((img) => (
                imageStates[img.id] && (
                    <ObjectManipulator
                        key={img.id}
                        id={img.id}
                        src={img.src}
                        state={imageStates[img.id]}
                    />
                )
            ))}
            {images.length === 0 && (
                <div style={{ color: '#666', pointerEvents: 'none' }}>
                    No images added. Click "Add Image" to start.
                </div>
            )}
        </div>
    );
};
