import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { twirpErrorFromResponse } from "./errors";

export * from './errors';

export interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

export interface TwirpClientProps {
  url: string;
  headers?: object;
  timeout?: number;
  auth?: {
    username: string;
    password: string;
  };
}

class TwirpProtobufClient {
  private axiosClient: AxiosInstance;

  constructor({ url, headers, ...config }: TwirpClientProps) {

    this.axiosClient = axios.create({
      ...config,
      baseURL: url,
      headers: {
        ...headers,
        accept: 'application/*',
        'content-type': 'application/protobuf'
      },
      responseType: 'arraybuffer'
    });
  }

  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
    return this.axiosClient.post(`/${service}/${method}`, data)
      .then((response: AxiosResponse<Uint8Array>) => {
        return response.data
      })
      .catch((error: AxiosError) => {
        if(error.response != undefined){
          throw twirpErrorFromResponse(error.response)
        }else {
          throw error
        }
      })
  }
}

export function twirpProtobufClient(config: TwirpClientProps): Rpc {
  return new TwirpProtobufClient(config);
}

export default twirpProtobufClient;
