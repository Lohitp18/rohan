export type PoleStatus = "Normal" | "Fault" | "Maintenance";

export type Pole = {
  _id?: string;
  id: string;
  lat: number;
  lon: number;
  tilt?: number;
  voltage?: number;
  current?: number;
  status?: PoleStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type User = {
  username: string;
  role: "admin" | "user";
};


