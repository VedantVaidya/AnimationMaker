export type ImageObject = {
    id: string;
    src: string; // Blob URL
    name: string;
};

export type TransformState = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number; // For flipping: 1 or -1
    scaleY: number; // For flipping: 1 or -1
    zIndex: number;
    crop?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
};

export type Keyframe = {
    id: string;
    timestamp: number; // In milliseconds? Or index? Requirement says "3 seconds per keyframe segment".
    // Actually, let's store it as index or simple ID since they are sequential steps.
    // But requirement says "key frame of all the images are recorded at that position for 3 seconds".
    // So maybe just an ordered list of states is enough.
    objectsState: Record<string, TransformState>; // Map ImageID -> State
};
