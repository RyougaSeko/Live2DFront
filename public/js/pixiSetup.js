export function initializePIXIApp(canvasElement) {
  return new PIXI.Application({
    view: canvasElement,
    transparent: true,
    autoStart: true,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
    powerPreference: "high-performance"
  });
} 