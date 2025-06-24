import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';

const App = () => {
  const [lines, setLines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef(null);
  const qrRef = useRef(null);

  const currentValue = lines[currentIndex] || '';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const cleaned = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== '');
      setLines(cleaned);
      setCurrentIndex(0);
      setIsFinished(false);
      setIsProcessing(true);
    };
    reader.readAsText(file);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const qrSvg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const logo = new Image();
      logo.src = '/03_QRbrand.png';
      logo.onload = () => {
        const logoSize = canvas.width * 0.2;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.drawImage(logo, x, y, logoSize, logoSize);
        URL.revokeObjectURL(url);

        setTimeout(() => {
          downloadCurrentQR();
        }, 300); // Espera un poco para asegurar que se dibujó todo
      };
    };

    img.src = url;
  };

  const downloadCurrentQR = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    const safeFileName =
      currentValue.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'codigo-qr';
    link.download = `sovi-QR.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Siguiente QR o terminar
    if (currentIndex < lines.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    } else {
      setIsProcessing(false);
      setIsFinished(true);
    }
  };

  useEffect(() => {
    if (isProcessing && currentValue) {
      drawCanvas();
    }
  }, [currentIndex, isProcessing, currentValue]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Generador Automático de Códigos QR con Logo</h1>

      {!isProcessing && !isFinished && (
        <input
          type="file"
          accept="text"
          onChange={handleFileUpload}
          style={{
            padding: '10px',
            width: '300px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '20px',
          }}
        />
      )}

      <div style={{ display: 'none' }}>
        <div ref={qrRef}>
          <QRCode value={currentValue} size={256} />
        </div>
        <canvas ref={canvasRef} width={256} height={256} />
      </div>

      {isFinished && (
        <div style={{ marginTop: '30px' }}>
          <h3>Todos los códigos QR han sido descargados.</h3>
          <p>¿Deseas subir otro archivo o terminar?</p>
          <button
            onClick={() => {
              setLines([]);
              setCurrentIndex(0);
              setIsFinished(false);
            }}
            style={buttonStyle}
          >
            Subir otro archivo
          </button>
          <button
            onClick={() =>
              alert('Proceso finalizado.')
            }
            style={buttonStyle}
          >
            Terminar
          </button>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  margin: '10px',
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default App;
