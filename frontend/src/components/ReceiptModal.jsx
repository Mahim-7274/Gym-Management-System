import { Printer, X } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
    if (!receipt) return null;

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', background: '#ffffff', color: '#000' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666' }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, color: '#000', fontSize: '1.8rem', letterSpacing: '2px' }}>AURA FITNESS</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>Official Digital Receipt</p>
                </div>

                <div style={{ borderTop: '2px dashed #ccc', borderBottom: '2px dashed #ccc', padding: '1.5rem 0', margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Date:</span>
                        <strong style={{ color: '#000' }}>{new Date().toLocaleDateString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Member:</span>
                        <strong style={{ color: '#000' }}>{receipt.memberName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Plan Renewed:</span>
                        <strong style={{ color: '#000' }}>{receipt.planName}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '1.2rem', color: '#666' }}>Total Paid</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>${receipt.amount}</span>
                </div>

                <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#000', color: '#fff' }} onClick={() => window.print()}>
                    <Printer size={18} /> Print Receipt
                </button>
            </div>
        </div>
    );
}
