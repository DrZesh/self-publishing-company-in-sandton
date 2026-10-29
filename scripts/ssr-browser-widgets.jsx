// Editors and interactive maps are mounted by the browser after the HTML loads.
export default function BrowserWidget() { return null; }
export const MapContainer = BrowserWidget;
export const TileLayer = BrowserWidget;
export const Marker = BrowserWidget;
export const Popup = BrowserWidget;
export const useMap = () => null;
