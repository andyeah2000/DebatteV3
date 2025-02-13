export class PortManager {
  private static instance: PortManager;
  private frontendPort: number = 3001;
  private backendPort: number = 4000;

  private frontendPortRange = [3001, 3002, 3003, 3004, 3005];
  private backendPortRange = [4000, 4001, 4002, 4003, 4004];

  private constructor() {}

  public static getInstance(): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager();
    }
    return PortManager.instance;
  }

  public getFrontendPort(): number {
    return this.frontendPort;
  }

  public getBackendPort(): number {
    return this.backendPort;
  }

  public getFrontendUrl(): string {
    return `http://127.0.0.1:${this.getFrontendPort()}`;
  }

  public getBackendUrl(): string {
    return `http://127.0.0.1:${this.getBackendPort()}`;
  }

  public getGraphQLUrl(): string {
    return `${this.getBackendUrl()}/graphql`;
  }

  public setFrontendPort(port: number): void {
    if (this.frontendPortRange.includes(port)) {
      this.frontendPort = port;
    } else {
      console.warn(`Port ${port} is not in the allowed frontend port range. Using default port ${this.frontendPort}`);
    }
  }

  public setBackendPort(port: number): void {
    if (this.backendPortRange.includes(port)) {
      this.backendPort = port;
    } else {
      console.warn(`Port ${port} is not in the allowed backend port range. Using default port ${this.backendPort}`);
    }
  }

  public getNextAvailableFrontendPort(): number {
    const currentIndex = this.frontendPortRange.indexOf(this.frontendPort);
    if (currentIndex < this.frontendPortRange.length - 1) {
      return this.frontendPortRange[currentIndex + 1];
    }
    return this.frontendPort; // Fallback to current port if no more available
  }

  public getNextAvailableBackendPort(): number {
    const currentIndex = this.backendPortRange.indexOf(this.backendPort);
    if (currentIndex < this.backendPortRange.length - 1) {
      return this.backendPortRange[currentIndex + 1];
    }
    return this.backendPort; // Fallback to current port if no more available
  }
} 