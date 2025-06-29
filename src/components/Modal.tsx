// src/components/Modal.tsx (versão mais avançada para arrastar)
import React, { useState, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
    const [isDragging, setIsDragging] = useState(false);

    // Efeito para fechar com tecla ESC (boa prática)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const handleMouseDownContent = () => {
        setIsDragging(true); // Indica que um arrasto pode ter começado dentro do conteúdo
    };

    const handleMouseUpOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
        // Se está arrastando (ou começou a arrastar dentro do conteúdo)
        // E o clique não foi diretamente na overlay (ou seja, veio de dentro)
        // NÂO fecha o modal.
        if (isDragging) {
            setIsDragging(false); // Reseta o estado de arrasto
            return; // Impede o fechamento se estava arrastando
        }

        // Se não estava arrastando E o clique foi direto na overlay, fecha o modal
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleMouseUpOverlay}>
            <div
                className="modal-content"
                // Adiciona listeners para mousedown/mouseup no conteúdo para rastrear arrasto
                onMouseDown={handleMouseDownContent}
                onMouseUp={() => setIsDragging(false)} // Reseta o arrasto se soltar dentro do modal
            >
                <button className="close-button" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
}