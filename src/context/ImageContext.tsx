import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { ImageObject, TransformState, Keyframe } from '../types';

interface ImageContextType {
    images: ImageObject[];
    imageStates: Record<string, TransformState>;
    selectedImageId: string | null;
    keyframes: Keyframe[];
    activeKeyframeId: string | null;
    isPlaying: boolean;

    addImage: (file: File) => void;
    removeImage: (id: string) => void;
    selectImage: (id: string | null) => void;
    updateImageState: (id: string, newState: Partial<TransformState>) => void;

    addKeyframe: () => void;
    updateKeyframe: (id: string) => void;
    loadKeyframe: (id: string) => void;
    deleteKeyframe: (id: string) => void;
    playAnimation: () => void;
    stopAnimation: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [images, setImages] = useState<ImageObject[]>([]);
    const [imageStates, setImageStates] = useState<Record<string, TransformState>>({});
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
    const [activeKeyframeId, setActiveKeyframeId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const playbackTimeoutRef = useRef<number | null>(null);
    const currentKeyframeIndexRef = useRef(0);

    const addImage = (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        const newImage: ImageObject = {
            id: crypto.randomUUID(),
            src: objectUrl,
            name: file.name,
        };

        // Initial state
        const initialState: TransformState = {
            x: 300,
            y: 300,
            width: 200,
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: Object.keys(imageStates).length + 1,
        };

        setImages((prev) => [...prev, newImage]);
        setImageStates((prev) => ({ ...prev, [newImage.id]: initialState }));
        setSelectedImageId(newImage.id);
    };

    const selectImage = (id: string | null) => {
        if (isPlaying) return; // Prevent selection during playback
        setSelectedImageId(id);
    };

    const updateImageState = (id: string, newState: Partial<TransformState>) => {
        if (isPlaying) return; // Prevent edits during playback
        setImageStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...newState },
        }));
    };

    const removeImage = (id: string) => {
        setImages((prev) => {
            const img = prev.find((i) => i.id === id);
            if (img) {
                URL.revokeObjectURL(img.src);
            }
            return prev.filter((i) => i.id !== id);
        });
        setImageStates((prev) => {
            const { [id]: deleted, ...rest } = prev;
            return rest;
        });
    };

    const addKeyframe = () => {
        const newKeyframe: Keyframe = {
            id: crypto.randomUUID(),
            // In a real app we might use index order, but timestamp works for ID
            // Logic: Append to end
            timestamp: Date.now(),
            objectsState: JSON.parse(JSON.stringify(imageStates)),
        };
        setKeyframes((prev) => [...prev, newKeyframe]);
        setActiveKeyframeId(newKeyframe.id);
    };

    const updateKeyframe = (id: string) => {
        setKeyframes((prev) => prev.map((kf) =>
            kf.id === id
                ? { ...kf, objectsState: JSON.parse(JSON.stringify(imageStates)) }
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
        if (activeKeyframeId === id) {
            setActiveKeyframeId(null);
        }
    };

    const playAnimation = () => {
        if (keyframes.length < 1) return;
        setIsPlaying(true);
        setSelectedImageId(null);
        currentKeyframeIndexRef.current = 0;

        // Start with first frame immediately
        setImageStates(JSON.parse(JSON.stringify(keyframes[0].objectsState)));

        const nextFrame = () => {
            currentKeyframeIndexRef.current += 1;

            if (currentKeyframeIndexRef.current >= keyframes.length) {
                setIsPlaying(false);
                currentKeyframeIndexRef.current = 0;
                return;
            }

            // Apply next state
            const nextState = keyframes[currentKeyframeIndexRef.current].objectsState;
            setImageStates(JSON.parse(JSON.stringify(nextState)));

            // Schedule next
            playbackTimeoutRef.current = setTimeout(nextFrame, 3000); // 3 seconds per frame
        };

        // First transition happens after 1 tick to ensure CSS transition sees the change?
        // Actually, we want to animate TO the next frame.
        // If we are at frame 0, we want to animate to frame 1 over 3 seconds.
        // So we wait very briefly then trigger nextFrame? or just normal flow.
        // Let's rely on the loop.
        playbackTimeoutRef.current = setTimeout(nextFrame, 3000);
    };

    const stopAnimation = () => {
        setIsPlaying(false);
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
        }
    };

    useEffect(() => {
        return () => {
            if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        };
    }, []);

    return (
        <ImageContext.Provider value={{
            images,
            imageStates,
            selectedImageId,
            keyframes,
            activeKeyframeId,
            isPlaying,
            addImage,
            removeImage,
            selectImage,
            updateImageState,
            addKeyframe,
            updateKeyframe,
            loadKeyframe,
            deleteKeyframe,
            playAnimation,
            stopAnimation
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
