import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, User } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function QRCodeModal({ member, onClose }) {
    const qrRef = useRef(null);

    const handleDownload = () => {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement('a');
            link.download = `QR-${member.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', textAlign: 'center' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '0.5rem' }}>Member QR Code</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Scan at the door for quick check-in</p>

                {/* Member Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                    {member.profilePicture ? (
                        <img 
                            src={`${API_BASE_URL}${member.profilePicture}`}
                            alt={member.name}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                        />
                    ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color="rgba(255,255,255,0.4)" />
                        </div>
                    )}
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{member.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {member.currentPlan?.name || 'No Plan'} • {member.phone}
                        </p>
                    </div>
                </div>

                {/* QR Code */}
                <div 
                    ref={qrRef}
                    style={{ 
                        background: '#ffffff', 
                        padding: '1.5rem', 
                        borderRadius: '16px', 
                        display: 'inline-block',
                        marginBottom: '2rem'
                    }}
                >
                    <QRCodeSVG 
                        value={member._id} 
                        size={200} 
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
                    ID: {member._id}
                </p>

                <button className="btn btn-primary" onClick={handleDownload} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={18} /> Download QR Code
                </button>
            </div>
        </div>
    );
}
