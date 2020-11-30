import axios, {AxiosInstance, AxiosResponse} from 'axios'
import {twirpErrorFromHttpStatus} from "./errors";

export * from './errors'

export interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}


export interface TwirpClientProps{
    url: string,
    headers?: {[key: string]: string},
    timeout?: number,
    withCredentials?: boolean,
    auth?: {
        username: string,
        password: string
    },
    maxRedirects?: number,
}

class TwirpProtobufClient {

    private axiosClient: AxiosInstance

    constructor({url, headers, ...config}: TwirpClientProps) {
        this.axiosClient = axios.create({
            ...config,
            baseURL: url,
            headers: {
                ...headers,
                "accept": "application/protobuf",
                "content-type": "application/protobuf"
            },
            responseType: 'arraybuffer',
            validateStatus: function (status) {
                return true; // default
            },
        })
    }

    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
        return this.axiosClient.post(`/${service}/${method}`, data)
            .then((response: AxiosResponse<Uint8Array>) => {
                if (response.status != 200) {
                    throw twirpErrorFromHttpStatus(response.status)
                } else {
                    return response.data
                }
            })
    }
}

export function twirpProtobufClient(config: TwirpClientProps): Rpc {
    return new TwirpProtobufClient(config)
}

export default twirpProtobufClient