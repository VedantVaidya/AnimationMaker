import React, { useRef } from 'react';
import { useImageContext } from '../../context/ImageContext';
import { Button } from '../common/Button';

export const Controllers: React.FC = () => {
    const {
        addImage,
        selectedImageId,
        imageStates,
        updateImageState,
        keyframes,
        activeKeyframeId,
        isPlaying,
        addKeyframe,
        updateKeyframe,
        loadKeyframe,
        playAnimation,
        stopAnimation
    } = useImageContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            addImage(e.target.files[0]);
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
                </div>
            )}

            {/* Animation Controls */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 600 }}>Animation</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '5px', opacity: 0.7 }}>Duration (ms)</label>
                    <input
                        type="number"
                        defaultValue={3000}
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
                        onClick={() => addKeyframe((window as any).__nextDuration || 3000)}
                        disabled={isPlaying}
                        style={{ flex: 1 }}
                    >
                        Freeze
                    </Button>

                    <Button
                        variant={isPlaying ? 'warning' : 'success'}
                        onClick={isPlaying ? stopAnimation : playAnimation}
                        style={{ flex: 1 }}
                    >
                        {isPlaying ? 'Stop' : 'Play'}
                    </Button>
                </div>

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
                    padding: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {keyframes.map((kf, index) => (
                        <div
                            key={kf.id}
                            onClick={() => !isPlaying && loadKeyframe(kf.id)}
                            style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: activeKeyframeId === kf.id ? '#00d2ff' : 'rgba(255,255,255,0.2)',
                                cursor: isPlaying ? 'default' : 'pointer',
                                border: activeKeyframeId === kf.id ? '2px solid rgba(255,255,255,0.5)' : 'none',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                                transform: activeKeyframeId === kf.id ? 'scale(1.2)' : 'scale(1)'
                            }}
                            title={`Keyframe ${index + 1}`}
                        />
                    ))}
                    {keyframes.length === 0 && (
                        <span style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>No frames yet</span>
                    )}
                </div>
            </div>
        </div>
    );
};
