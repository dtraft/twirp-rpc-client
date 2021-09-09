import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { twirpErrorFromResponse } from './errors';

export * from './errors';

export interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

export interface TwirpClientProps {
  url: string; // base url of the twirp service
  headers?: object; // additional headers to add to the request e.g. { "x-custom-header": "header-value" }
  timeout?: number; // timeout in milliseconds
  // basic auth helper
  auth?: {
    username: string;
    password: string;
  };
  withCredentials: bool; // whether cross-site Access-Control requests should be made using credentials
}

class TwirpProtobufClient {
  private axiosClient: AxiosInstance;

  constructor({ url, headers, ...config }: TwirpClientProps) {
    this.axiosClient = axios.create({
      ...config,
      baseURL: url,
      headers: {
        ...headers,
        accept: 'application/protobuf,application/json',
        'content-type': 'application/protobuf',
      },
      responseType: 'arraybuffer',
    });
  }

  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
    return this.axiosClient
      .post(`/${service}/${method}`, data)
      .then((response: AxiosResponse<Buffer>) => {
        return Buffer ? Buffer.from(response.data) : new Uint8Array(response.data);
      })
      .catch((error: AxiosError) => {
        if (error.response != undefined) {
          throw twirpErrorFromResponse(error.response);
        } else {
          throw error;
        }
      });
  }
}

export function twirpProtobufClient(config: TwirpClientProps): Rpc {
  return new TwirpProtobufClient(config);
}

export default twirpProtobufClient;
