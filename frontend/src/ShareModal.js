// ShareModal.js
import React from 'react';
import './ShareModal.css'; // Add your styles here

const ShareModal = ({ isVisible, onClose, whatsappUrl, telegramUrl }) => {
  if (!isVisible) return null;

  return (
    <div className="share-modal-overlayy">
      <div className="share-modall">
        <h3>Share this post</h3>
        <button
          className="share-option-buttonn"
          onClick={() => window.open(whatsappUrl, '_blank')}
        >
          Share on WhatsApp
        </button>
        <button
          className="share-option-buttonn"
          onClick={() => window.open(telegramUrl, '_blank')}
        >
          Share on Telegram
        </button>
        <button className="share-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
