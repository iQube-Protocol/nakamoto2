
// Extended Navigator interface with mobile web app properties
interface Navigator {
  standalone?: boolean;
}

// Extended Screen interface with orientation properties
interface ScreenOrientation {
  lock(orientation: 'portrait' | 'landscape'): Promise<void>;
}

// Ensure Screen interface includes orientation property
interface Screen {
  orientation?: ScreenOrientation;
}
