import React, { useState } from 'react';
import { Box, Modal, IconButton, Paper } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

export default function ImageGallery({ images }) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          bgcolor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        <img src="https://via.placeholder.com/800x400?text=No+Image" alt="No" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <img
          src={images[currentIndex]}
          alt={`Фото ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
            borderRadius: 12,
            cursor: 'pointer',
          }}
          onClick={() => setOpen(true)}
        />
        {images.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}
        <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
          {currentIndex + 1} / {images.length}
        </Box>
      </Box>

      {/* Modal for fullscreen */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            height: '90vh',
            bgcolor: 'black',
            boxShadow: 24,
            outline: 'none',
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 10, top: 10, color: 'white', zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={images[currentIndex]}
            alt={`Фото ${currentIndex + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}