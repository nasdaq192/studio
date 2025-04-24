"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RectangleVertical, Circle as CircleIcon, Pencil, Download, Eraser } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DrawingCoordinates {
  x: number;
  y: number;
}

const Whiteboard = () => {
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'rectangle' | 'circle' | 'line' | 'eraser' | 'fill'>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingCoordinates[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingColor, setDrawingColor] = useState<string>('#000000'); // Default color black
  const [drawingHistory, setDrawingHistory] = useState<string[]>([]); // Stores canvas snapshots
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

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
        context.lineJoin = 'round';
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // Load previous drawings from history
        drawingHistory.forEach(data => {
          const img = new Image();
          img.src = data;
          img.onload = () => context.drawImage(img, 0, 0);
        });
      }
    }
  }, [canvasWidth, canvasHeight, drawingHistory]);

  const handleToolChange = (tool: 'pencil' | 'rectangle' | 'circle' | 'line' | 'eraser' | 'fill') => {
    setSelectedTool(tool);
  };

  const handleBrushSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBrushSize(Number(event.target.value));
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    startX.current = offsetX;
    startY.current = offsetY;
    setCurrentPath([{ x: offsetX, y: offsetY }]);

    if (canvasRef.current && canvasContext) {
      canvasContext.beginPath();
      canvasContext.lineWidth = brushSize;
      canvasContext.strokeStyle = drawingColor;
      canvasContext.fillStyle = drawingColor;
      canvasContext.moveTo(offsetX, offsetY);

      if (selectedTool === 'eraser') {
        canvasContext.globalCompositeOperation = 'destination-out';
      } else {
        canvasContext.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasContext) return;

    const { offsetX, offsetY } = event.nativeEvent;
    const newPoint = { x: offsetX, y: offsetY };

    if (selectedTool === 'pencil' || selectedTool === 'eraser') {
      if (canvasContext) {
        canvasContext.lineTo(offsetX, offsetY);
        canvasContext.stroke();
        setCurrentPath(prevPath => [...prevPath, newPoint]);
      }
    }
  };


  const endDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canvasContext) return;
    setDrawing(false);
    if (currentPath.length > 0) {
      const { offsetX, offsetY } = event.nativeEvent;
      if (canvasContext) {
        if (selectedTool === 'rectangle') {
          canvasContext.rect(startX.current, startY.current, offsetX - startX.current, offsetY - startY.current);
          canvasContext.stroke();
        } else if (selectedTool === 'circle') {
          const radius = Math.sqrt(Math.pow(offsetX - startX.current, 2) + Math.pow(offsetY - startY.current, 2));
          canvasContext.arc(startX.current, startY.current, radius, 0, 2 * Math.PI);
          canvasContext.stroke();
        } else if (selectedTool === 'line') {
          canvasContext.lineTo(offsetX, offsetY);
          canvasContext.stroke();
        } else if (selectedTool === 'fill') {
          canvasContext.fill();
        }
      }
      setDrawingHistory(prev => [...prev, canvasRef.current!.toDataURL()]);
      setCurrentPath([]);
    }
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
    if (canvasContext) {
      canvasContext.strokeStyle = color;
      canvasContext.fillStyle = color;
    }
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
          <CircleIcon className="h-5 w-5" />
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
        <Button variant={selectedTool === 'fill' ? 'default' : 'outline'} onClick={() => handleToolChange('fill')}>
          Fill
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
                  <Button variant="outline" className="w-20" style={{ backgroundColor: drawingColor === '#000000' ? 'hsl(var(--primary))' : '#000000', color: drawingColor === '#000000' ? 'hsl(var(--primary-foreground))' : 'inherit' } as React.CSSProperties} onClick={() => handleColorChange('#000000')}>Black</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: drawingColor === '#FF0000' ? 'hsl(var(--primary))' : '#FF0000', color: drawingColor === '#FF0000' ? 'hsl(var(--primary-foreground))' : 'inherit' } as React.CSSProperties} onClick={() => handleColorChange('#FF0000')}>Red</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: drawingColor === '#00FF00' ? 'hsl(var(--primary))' : '#00FF00', color: drawingColor === '#00FF00' ? 'hsl(var(--primary-foreground))' : 'inherit' } as React.CSSProperties} onClick={() => handleColorChange('#00FF00')}>Green</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-20" style={{ backgroundColor: drawingColor === '#0000FF' ? 'hsl(var(--primary))' : '#0000FF', color: drawingColor === '#0000FF' ? 'hsl(var(--primary-foreground))' : 'inherit' } as React.CSSProperties} onClick={() => handleColorChange('#0000FF')}>Blue</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: drawingColor === '#FFFFFF' ? 'hsl(var(--primary))' : '#FFFFFF', color: drawingColor === '#FFFFFF' ? 'hsl(var(--primary-foreground))' : '#000' } as React.CSSProperties} onClick={() => handleColorChange('#FFFFFF')}>White</Button>
                  <Button variant="outline" className="w-20" style={{ backgroundColor: drawingColor === '#FFFF00' ? 'hsl(var(--primary))' : '#FFFF00', color: drawingColor === '#FFFF00' ? 'hsl(var(--primary-foreground))' : 'inherit' } as React.CSSProperties} onClick={() => handleColorChange('#FFFF00')}>Yellow</Button>
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
        style={{ background: 'white' }}
        className="bg-background cursor-pointer"
        onMouseDown={startDrawing}
        onMouseMove={drawing ? draw : null}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
};

export default Whiteboard;
