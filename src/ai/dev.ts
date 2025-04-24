import { useEffect, useRef, useState } from "react";

enum CanvasMode {
  DRAW,
  ERASE,
  FILL,
  SQUARE,
  CIRCLE,
}

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [isFillEnabled, setIsFillEnabled] = useState(false);
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const mode = useRef<CanvasMode>(CanvasMode.DRAW); // Default mode

  const toggleErase = () => {
    setIsErasing(!isErasing);
    mode.current = isErasing ? CanvasMode.DRAW : CanvasMode.ERASE;
  };

  const toggleFill = () => {
    mode.current = CanvasMode.FILL;
    setIsFillEnabled(true);
  };

  const toggleSquare = () => {
    mode.current = CanvasMode.SQUARE;
    setIsFillEnabled(false);
  };

  const toggleCircle = () => {
    mode.current = CanvasMode.CIRCLE;
    setIsFillEnabled(false);
  };

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    canvasRef.current = canvas;

    const context = canvas.getContext("2d");
    if (context) {
      setCanvasContext(context);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.lineCap = "round";
      context.strokeStyle = "red";
      context.lineWidth = 2;

      let isDrawing = false;
      let startX = 0;
      let startY = 0;

      canvas.addEventListener("mousedown", (e) => {
        startX = e.offsetX;
        startY = e.offsetY;

        if (mode.current === CanvasMode.FILL && context) {
          context.fill();
        } else if (mode.current === CanvasMode.SQUARE) {
          isDrawing = true;
        } else if (mode.current === CanvasMode.CIRCLE) {
          isDrawing = true;
        } else {
          isDrawing = true;
        }
        context.beginPath();
      });

      canvas.addEventListener("mousemove", (e) => {
        if (isDrawing) {
          if (mode.current === CanvasMode.ERASE) {
            context.globalCompositeOperation = "destination-out";
            context.clearRect(e.offsetX, e.offsetY, 20, 20);
          } else if (mode.current === CanvasMode.DRAW) {
            context.globalCompositeOperation = "source-over";
            context.lineTo(e.offsetX, e.offsetY);
            context.stroke();
          } else if (mode.current === CanvasMode.SQUARE) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
          } else if (mode.current === CanvasMode.CIRCLE) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            const radius = Math.sqrt(Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2))
            context.beginPath()
            context.arc(startX, startY, radius, 0, 2 * Math.PI);
            context.fill();
          }
        }
      });

      canvas.addEventListener("mouseup", (e) => {
        
        isDrawing = true;
        context.beginPath();
        context.moveTo(e.offsetX, e.offsetY);
      });

      canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
          context.beginPath();
          if (mode.current === CanvasMode.ERASE) {
            context.globalCompositeOperation = "destination-out";
            context.clearRect(e.offsetX, e.offsetY, 20, 20);
          } else if (mode.current === CanvasMode.DRAW){
            context.globalCompositeOperation = "source-over";
            context.lineTo(e.offsetX, e.offsetY);
            context.stroke();
          }
        }
      });

      canvas.addEventListener("mouseup", () => (isDrawing = false));
    }
  }, []);

  return [isErasing, toggleErase, toggleFill, toggleSquare, toggleCircle, isFillEnabled, canvasRef] as const;
};
