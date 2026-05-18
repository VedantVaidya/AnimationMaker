import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { ImageObject, TransformState, Keyframe } from '../types';

interface ImageContextType {
    images: ImageObject[];
    imageStates: Record<string, TransformState>;
    selectedImageId: string | null;
    keyframes: Keyframe[];
    activeKeyframeId: string | null;
    isPlaying: boolean;
    currentDuration: number;
    currentStepIndex: number | null;

    addImage: (file: File) => void;
    removeImage: (id: string) => void;
    selectImage: (id: string | null) => void;
    updateImageState: (id: string, newState: Partial<TransformState>) => void;

    addKeyframe: (duration?: number) => void;
    updateKeyframe: (id: string, duration?: number) => void;
    loadKeyframe: (id: string) => void;
    deleteKeyframe: (id: string) => void;
    stepNext: () => void;
    stepPrev: () => void;
    exitStepMode: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [images, setImages] = useState<ImageObject[]>([]);
    const [imageStates, setImageStates] = useState<Record<string, TransformState>>({});
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
    const [activeKeyframeId, setActiveKeyframeId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentDuration, setCurrentDuration] = useState(500);
    const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

    const addImage = (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let width = 200;
            let height = 200;

            if (aspectRatio > 1) {
                width = 200;
                height = 200 / aspectRatio;
            } else {
                height = 200;
                width = 200 * aspectRatio;
            }

            const newImage: ImageObject = {
                id: crypto.randomUUID(),
                src: objectUrl,
                name: file.name,
            };

            const initialState: TransformState = {
                x: 300,
                y: 300,
                width,
                height,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: Object.keys(imageStates).length + 1,
            };

            setImages((prev) => [...prev, newImage]);
            setImageStates((prev) => ({ ...prev, [newImage.id]: initialState }));
            setSelectedImageId(newImage.id);
        };
    };

    const selectImage = (id: string | null) => {
        if (isPlaying) return;
        setSelectedImageId(id);
    };

    const updateImageState = (id: string, newState: Partial<TransformState>) => {
        if (isPlaying) return;
        setImageStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...newState },
        }));
    };

    const removeImage = (id: string) => {
        setImages((prev) => {
            const img = prev.find((i) => i.id === id);
            if (img) URL.revokeObjectURL(img.src);
            return prev.filter((i) => i.id !== id);
        });
        setImageStates((prev) => {
            const { [id]: _deleted, ...rest } = prev;
            return rest;
        });
    };

    const addKeyframe = (duration: number = 500) => {
        const newKeyframe: Keyframe = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            duration,
            objectsState: JSON.parse(JSON.stringify(imageStates)),
        };
        setKeyframes((prev) => [...prev, newKeyframe]);
        setActiveKeyframeId(newKeyframe.id);
    };

    const updateKeyframe = (id: string, duration?: number) => {
        setKeyframes((prev) => prev.map((kf) =>
            kf.id === id
                ? {
                    ...kf,
                    objectsState: JSON.parse(JSON.stringify(imageStates)),
                    duration: duration !== undefined ? duration : kf.duration,
                }
                : kf
        ));
    };

    const loadKeyframe = (id: string) => {
        const kf = keyframes.find((k) => k.id === id);
        if (kf) {
            setImageStates(JSON.parse(JSON.stringify(kf.objectsState)));
            setActiveKeyframeId(id);
            setSelectedImageId(null);
        }
    };

    const deleteKeyframe = (id: string) => {
        setKeyframes((prev) => prev.filter((k) => k.id !== id));
        if (activeKeyframeId === id) setActiveKeyframeId(null);
    };

    const stepTo = (index: number) => {
        const targetKf = keyframes[index];
        setCurrentDuration(targetKf.duration || 500);
        setIsPlaying(true);
        setImageStates(JSON.parse(JSON.stringify(targetKf.objectsState)));
        setCurrentStepIndex(index);
        setActiveKeyframeId(targetKf.id);
        setSelectedImageId(null);
    };

    const stepNext = () => {
        if (keyframes.length === 0) return;
        const nextIndex = currentStepIndex === null ? 0 : (currentStepIndex + 1) % keyframes.length;
        stepTo(nextIndex);
    };

    const stepPrev = () => {
        if (keyframes.length === 0) return;
        const prevIndex = currentStepIndex === null
            ? keyframes.length - 1
            : (currentStepIndex - 1 + keyframes.length) % keyframes.length;
        stepTo(prevIndex);
    };

    const exitStepMode = () => {
        setIsPlaying(false);
        setCurrentStepIndex(null);
    };

    return (
        <ImageContext.Provider value={{
            images,
            imageStates,
            selectedImageId,
            keyframes,
            activeKeyframeId,
            isPlaying,
            currentDuration,
            currentStepIndex,
            addImage,
            removeImage,
            selectImage,
            updateImageState,
            addKeyframe,
            updateKeyframe,
            loadKeyframe,
            deleteKeyframe,
            stepNext,
            stepPrev,
            exitStepMode,
        }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImageContext = () => {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error('useImageContext must be used within an ImageProvider');
    }
    return context;
};
