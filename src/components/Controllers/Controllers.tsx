import React, { useRef, useEffect } from 'react';
import { useImageContext } from '../../context/ImageContext';
import { Button } from '../common/Button';

export const Controllers: React.FC = () => {
    const {
        images,
        addImage,
        selectedImageId,
        imageStates,
        updateImageState,
        keyframes,
        activeKeyframeId,
        isPlaying,
        currentStepIndex,
        addKeyframe,
        updateKeyframe,
        loadKeyframe,
        stepNext,
        stepPrev,
        removeImage,
        exitStepMode,
        reorderKeyframes,
        undo,
        canUndo,
        saveProject,
        loadProject,
    } = useImageContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectInputRef = useRef<HTMLInputElement>(null);
    const dragIndexRef = useRef<number | null>(null);
    const [dropGap, setDropGap] = React.useState<number | null>(null);

    const DOT_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#20c997', '#f06595'];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (keyframes.length === 0) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); stepNext(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); stepPrev(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keyframes.length, stepNext, stepPrev]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            addImage(e.target.files[0]);
            e.target.value = '';
        }
    };

    const handleProjectLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            loadProject(e.target.files[0]);
            e.target.value = '';
        }
    };

    return (
        <div style={{ color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.5px' }}>Controls</h3>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
            />

            <input
                type="file"
                ref={projectInputRef}
                onChange={handleProjectLoad}
                style={{ display: 'none' }}
                accept=".animproj"
            />

            <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={() => saveProject()} style={{ flex: 1, fontSize: '0.8rem' }}>
                    Save
                </Button>
                <Button onClick={() => projectInputRef.current?.click()} style={{ flex: 1, fontSize: '0.8rem' }}>
                    Load
                </Button>
                <Button onClick={undo} disabled={!canUndo} style={{ flex: 1, fontSize: '0.8rem' }}>
                    Undo
                </Button>
            </div>

            <Button
                variant="primary"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
            >
                Add Image
            </Button>

            {selectedImageId && (
                <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.8 }}>Selected Image</h4>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '5px', textTransform: 'uppercase', opacity: 0.6 }}>Layering</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button style={{ flex: 1 }} onClick={() => {
                                const currentState = imageStates[selectedImageId];
                                if (currentState) updateImageState(selectedImageId, { zIndex: currentState.zIndex + 1 });
                            }}>Forward</Button>
                            <Button style={{ flex: 1 }} onClick={() => {
                                const currentState = imageStates[selectedImageId];
                                if (currentState) updateImageState(selectedImageId, { zIndex: Math.max(0, currentState.zIndex - 1) });
                            }}>Backward</Button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '5px', textTransform: 'uppercase', opacity: 0.6 }}>Flip</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button style={{ flex: 1 }} onClick={() => {
                                const currentState = imageStates[selectedImageId];
                                if (currentState) updateImageState(selectedImageId, { scaleX: currentState.scaleX * -1 });
                            }}>Horz</Button>
                            <Button style={{ flex: 1 }} onClick={() => {
                                const currentState = imageStates[selectedImageId];
                                if (currentState) updateImageState(selectedImageId, { scaleY: currentState.scaleY * -1 });
                            }}>Vert</Button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '5px', textTransform: 'uppercase', opacity: 0.6 }}>Crop (%)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['top', 'right', 'bottom', 'left'].map((side) => (
                                <div key={side} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '10px', width: '15px', opacity: 0.7 }}>{side[0].toUpperCase()}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={imageStates[selectedImageId]?.crop?.[side as keyof typeof imageStates[string]['crop']] || 0}
                                        onChange={(e) => {
                                            const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                            const currentCrop = imageStates[selectedImageId]?.crop || { top: 0, right: 0, bottom: 0, left: 0 };
                                            updateImageState(selectedImageId, {
                                                crop: { ...currentCrop, [side]: val }
                                            });
                                        }}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '4px',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="danger"
                        fullWidth
                        onClick={() => {
                            updateImageState(selectedImageId, { hidden: true });
                            selectImage(null);
                        }}
                        style={{ marginTop: '5px' }}
                    >
                        Delete Image
                    </Button>
                </div>
            )}

            {/* Hidden images — restore panel */}
            {images.some((img) => imageStates[img.id]?.hidden) && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', opacity: 0.6 }}>Hidden Images</h4>
                    {images.filter((img) => imageStates[img.id]?.hidden).map((img) => (
                        <div key={img.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{img.name}</span>
                            <Button
                                onClick={() => updateImageState(img.id, { hidden: false })}
                                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                            >
                                Restore
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Animation Controls */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 600 }}>Animation</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '5px', opacity: 0.7 }}>Duration (ms)</label>
                    <input
                        type="number"
                        defaultValue={500}
                        step={100}
                        min={100}
                        onChange={(e) => {
                            // Temporary storage or ref? 
                            // We need to pass this to addKeyframe.
                            // Let's us a ref or state in Controller?
                            // Actually, let's use a local ref for now since it's just for the next freeze.
                            (window as any).__nextDuration = Number(e.target.value);
                        }}
                        style={{ width: '100%', padding: '5px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                    <Button
                        variant="danger"
                        onClick={() => addKeyframe((window as any).__nextDuration || 500)}
                        disabled={isPlaying}
                        style={{ flex: 1 }}
                    >
                        Freeze
                    </Button>

                    {!isPlaying ? (
                        <Button
                            variant="success"
                            onClick={stepNext}
                            disabled={keyframes.length === 0}
                            style={{ flex: 1 }}
                        >
                            Play
                        </Button>
                    ) : (
                        <>
                            <Button onClick={stepPrev} style={{ flex: 1 }}>Prev</Button>
                            <Button variant="success" onClick={stepNext} style={{ flex: 1 }}>Next</Button>
                        </>
                    )}
                </div>

                {isPlaying && (
                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>
                            Frame {currentStepIndex !== null ? currentStepIndex + 1 : '—'} / {keyframes.length}
                        </span>
                        <Button variant="warning" onClick={exitStepMode} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                            Exit
                        </Button>
                    </div>
                )}

                {activeKeyframeId && !isPlaying && (
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => updateKeyframe(activeKeyframeId)}
                        style={{ marginBottom: '15px', fontSize: '0.8rem' }}
                    >
                        Update Keyframe
                    </Button>
                )}

                {/* Timeline */}
                <div style={{
                    height: '150px',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    padding: '8px 15px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {keyframes.map((kf, index) => (
                        <React.Fragment key={kf.id}>
                            {/* Drop zone above this dot */}
                            <div
                                style={{ width: '100%', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                onDragOver={(e) => { e.preventDefault(); setDropGap(index); }}
                                onDragLeave={() => setDropGap(null)}
                                onDrop={() => {
                                    if (dragIndexRef.current !== null) reorderKeyframes(dragIndexRef.current, index);
                                    dragIndexRef.current = null;
                                    setDropGap(null);
                                }}
                            >
                                <div style={{ width: '70%', height: '2px', borderRadius: '1px', background: dropGap === index ? '#00d2ff' : 'transparent', transition: 'background 0.1s' }} />
                            </div>

                            {/* The dot */}
                            <div
                                draggable={!isPlaying}
                                onClick={() => !isPlaying && loadKeyframe(kf.id)}
                                onDragStart={() => { dragIndexRef.current = index; }}
                                onDragEnd={() => { dragIndexRef.current = null; setDropGap(null); }}
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    background: activeKeyframeId === kf.id ? DOT_COLORS[index % DOT_COLORS.length] : DOT_COLORS[index % DOT_COLORS.length] + '66',
                                    border: activeKeyframeId === kf.id ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                                    cursor: isPlaying ? 'default' : 'grab',
                                    transform: activeKeyframeId === kf.id ? 'scale(1.2)' : 'scale(1)',
                                    transition: 'all 0.2s ease',
                                }}
                                title={`Keyframe ${index + 1}`}
                            />
                        </React.Fragment>
                    ))}

                    {/* Drop zone after the last dot */}
                    {keyframes.length > 0 && (
                        <div
                            style={{ width: '100%', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                            onDragOver={(e) => { e.preventDefault(); setDropGap(keyframes.length); }}
                            onDragLeave={() => setDropGap(null)}
                            onDrop={() => {
                                if (dragIndexRef.current !== null) reorderKeyframes(dragIndexRef.current, keyframes.length);
                                dragIndexRef.current = null;
                                setDropGap(null);
                            }}
                        >
                            <div style={{ width: '70%', height: '2px', borderRadius: '1px', background: dropGap === keyframes.length ? '#00d2ff' : 'transparent', transition: 'background 0.1s' }} />
                        </div>
                    )}

                    {keyframes.length === 0 && (
                        <span style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>No frames yet</span>
                    )}
                </div>
            </div>
        </div>
    );
};
