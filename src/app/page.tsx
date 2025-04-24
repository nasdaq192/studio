"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RectangleVertical, Circle, Pencil, Download, Eraser } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DrawingCoordinates {
  x: number;
  y: number;
}

const Whiteboard = () => {
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'rectangle' | 'circle' | 'line' | 'eraser'>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [drawingData, setDrawingData] = useState<DrawingCoordinates[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingColor, setDrawingColor] = useState<string>('#000000'); // Default color black
  const [snapshot, setSnapshot] = useState<string | null>(null);

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

  const handleToolChange = (tool: 'pencil' | 'rectangle' | 'circle' | 'line' | 'eraser') => {
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

    if (canvasRef.current) {
      setSnapshot(canvasRef.current.toDataURL());
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasContext || !startPosition) return;

    const { offsetX, offsetY } = event.nativeEvent;

    if (canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          if(context) {
            if (snapshot) {
                const img = new Image();
                img.src = snapshot;
                img.onload = () => {
                    context.clearRect(0, 0, canvasWidth, canvasHeight);
                    context.drawImage(img, 0, 0);
                    context.lineWidth = brushSize;
                    context.strokeStyle = drawingColor;

                    switch (selectedTool) {
                      case 'pencil':
                        const newDrawingData = [...drawingData, { x: offsetX, y: offsetY }];
                        setDrawingData(newDrawingData);

                        context.beginPath();
                        context.moveTo(startPosition.x, startPosition.y);
                        newDrawingData.forEach((point) => {
                          context.lineTo(point.x, point.y);
                          context.stroke();
                        });
                        break;
                      case 'rectangle':
                        const rectWidth = offsetX - startPosition.x;
                        const rectHeight = offsetY - startPosition.y;
                        context.strokeRect(startPosition.x, startPosition.y, rectWidth, rectHeight);
                        break;
                      case 'circle':
                        const radius = Math.sqrt(Math.pow(offsetX - startPosition.x, 2) + Math.pow(offsetY - startPosition.y, 2));
                        context.beginPath();
                        context.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
                        context.stroke();
                        break;
                      case 'line':
                        context.beginPath();
                        context.moveTo(startPosition.x, startPosition.y);
                        context.lineTo(offsetX, offsetY);
                        context.stroke();
                        break;
                      case 'eraser':
                        context.clearRect(offsetX - brushSize / 2, offsetY - brushSize / 2, brushSize, brushSize);
                        break;
                      default:
                        break;
                    }
                };
            } else {
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.lineWidth = brushSize;
                context.strokeStyle = drawingColor;

                switch (selectedTool) {
                  case 'pencil':
                    const newDrawingData = [...drawingData, { x: offsetX, y: offsetY }];
                    setDrawingData(newDrawingData);

                    context.beginPath();
                    context.moveTo(startPosition.x, startPosition.y);
                    newDrawingData.forEach((point) => {
                      context.lineTo(point.x, point.y);
                      context.stroke();
                    });
                    break;
                  case 'rectangle':
                    const rectWidth = offsetX - startPosition.x;
                    const rectHeight = offsetY - startPosition.y;
                    context.strokeRect(startPosition.x, startPosition.y, rectWidth, rectHeight);
                    break;
                  case 'circle':
                    const radius = Math.sqrt(Math.pow(offsetX - startPosition.x, 2) + Math.pow(offsetY - startPosition.y, 2));
                    context.beginPath();
                    context.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
                    context.stroke();
                    break;
                  case 'line':
                    context.beginPath();
                    context.moveTo(startPosition.x, startPosition.y);
                    context.lineTo(offsetX, offsetY);
                    context.stroke();
                    break;
                  case 'eraser':
                    context.clearRect(offsetX - brushSize / 2, offsetY - brushSize / 2, brushSize, brushSize);
                    break;
                  default:
                    break;
                }
            }
        }
    }
  };

  const endDrawing = () => {
    setDrawing(false);
    setStartPosition(null);
    setDrawingData([]);
    setSnapshot(canvasRef.current?.toDataURL() || null);
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

  const handleColorChange = (color: string) => {
    setDrawingColor(color);
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
        <Button variant={selectedTool === 'eraser' ? 'default' : 'outline'} onClick={() => handleToolChange('eraser')}>
          <Eraser className="h-5 w-5" />
        </Button>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
          className="ml-4"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-4">
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">
                  Select Drawing Color
                </h4>
                <p className="text-sm text-muted-foreground">
                  Choose a color to draw with.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="color" className="text-right">
                    Hex Value:
                  </Label>
                  <Input
                    id="color"
                    value={drawingColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="ml-2 w-40"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-20" style={{ backgroundColor: '#000000' }} onClick={() => handleColorChange('#000000')}>Black</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: '#FF0000' }} onClick={() => handleColorChange('#FF0000')}>Red</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: '#00FF00' }} onClick={() => handleColorChange('#00FF00')}>Green</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-20" style={{ backgroundColor: '#0000FF' }} onClick={() => handleColorChange('#0000FF')}>Blue</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: '#FFFFFF', color: '#000' }} onClick={() => handleColorChange('#FFFFFF')}>White</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: '#FFFF00' }} onClick={() => handleColorChange('#FFFF00')}>Yellow</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="ml-auto" onClick={downloadDrawing}>
          <Download className="h-5 w-5 mr-2" />
          Export
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ background: `url(${snapshot})`, backgroundSize: 'cover' }}
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
