"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RectangleVertical, Circle, Pencil, Download } from 'lucide-react';

interface DrawingCoordinates {
  x: number;
  y: number;
}

const Whiteboard = () => {
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'rectangle' | 'circle' | 'line'>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [drawingData, setDrawingData] = useState<DrawingCoordinates[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasImageRef = useRef<HTMLImageElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const updateCanvasDimensions = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight - 50);
    };

    if (typeof window !== 'undefined') {
      updateCanvasDimensions();
      window.addEventListener('resize', updateCanvasDimensions);
      return () => window.removeEventListener('resize', updateCanvasDimensions);
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && canvasWidth && canvasHeight) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        setCanvasContext(context);
        context.lineCap = 'round';
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }
  }, [canvasWidth, canvasHeight]);

  const handleToolChange = (tool: 'pencil' | 'rectangle' | 'circle' | 'line') => {
    setSelectedTool(tool);
  };

  const handleBrushSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBrushSize(Number(event.target.value));
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    setStartPosition({ x: offsetX, y: offsetY });
    setDrawingData([{ x: offsetX, y: offsetY }]);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasContext || !startPosition) return;

    const { offsetX, offsetY } = event.nativeEvent;

    canvasContext.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    canvasContext.lineWidth = brushSize;

    switch (selectedTool) {
      case 'pencil':
        const newDrawingData = [...drawingData, { x: offsetX, y: offsetY }];
        setDrawingData(newDrawingData);

        canvasContext.beginPath();
        canvasContext.moveTo(drawingData[0].x, drawingData[0].y);
        newDrawingData.forEach((point, index) => {
          canvasContext.lineTo(point.x, point.y);
        });
        canvasContext.stroke();
        break;
      case 'rectangle':
        const rectWidth = offsetX - startPosition.x;
        const rectHeight = offsetY - startPosition.y;
        canvasContext.strokeRect(startPosition.x, startPosition.y, rectWidth, rectHeight);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(offsetX - startPosition.x, 2) + Math.pow(offsetY - startPosition.y, 2));
        canvasContext.beginPath();
        canvasContext.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
        canvasContext.stroke();
        break;
      case 'line':
        canvasContext.beginPath();
        canvasContext.moveTo(startPosition.x, startPosition.y);
        canvasContext.lineTo(offsetX, offsetY);
        canvasContext.stroke();
        break;
      default:
        break;
    }
  };

  const endDrawing = () => {
    setDrawing(false);
    setStartPosition(null);
    setDrawingData([]);
  };

  const downloadDrawing = () => {
    if (!canvasRef.current) return;
    const image = canvasRef.current.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.download = 'whiteboard_drawing.png';
    link.href = image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center p-4 bg-secondary">
        <Button variant={selectedTool === 'pencil' ? 'default' : 'outline'} onClick={() => handleToolChange('pencil')}>
          <Pencil className="h-5 w-5" />
        </Button>
        <Button variant={selectedTool === 'rectangle' ? 'default' : 'outline'} onClick={() => handleToolChange('rectangle')}>
          <RectangleVertical className="h-5 w-5" />
        </Button>
        <Button variant={selectedTool === 'circle' ? 'default' : 'outline'} onClick={() => handleToolChange('circle')}>
          <Circle className="h-5 w-5" />
        </Button>
        <Button variant={selectedTool === 'line' ? 'default' : 'outline'} onClick={() => handleToolChange('line')}>
           <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-minus"
            >
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
        </Button>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
          className="ml-4"
        />
        <Button variant="outline" className="ml-auto" onClick={downloadDrawing}>
          <Download className="h-5 w-5 mr-2" />
          Export
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="bg-background cursor-pointer"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
};

export default Whiteboard;
