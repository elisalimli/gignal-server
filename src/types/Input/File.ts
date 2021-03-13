import { Stream } from "stream";

export interface File {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;

}