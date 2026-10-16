import type { BmmConnect, ConnectOptions } from "./index.js";
export { BmmError } from "./index.js";
export function createBmmConnect(options: ConnectOptions): BmmConnect & {
  handlers: {
    connect(request: Request): Promise<Response>;
    callback(request: Request): Promise<Response>;
    disconnect(request: Request): Promise<Response>;
  };
};
