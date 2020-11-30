/* eslint-disable */
import { Reader, Writer } from 'protobufjs/minimal';


/**
 *  A Hat is a piece of headwear made by a Haberdasher.
 */
export interface Hat {
  /**
   *  The size of a hat should always be in inches.
   */
  size: number;
  /**
   *  The color of a hat will never be 'invisible', but other than
   *  that, anything is fair game.
   */
  color: string;
  /**
   *  The name of a hat is it's type. Like, 'bowler', or something.
   */
  name: string;
}

/**
 *  Size is passed when requesting a new hat to be made. It's always
 *  measured in inches.
 */
export interface Size {
  inches: number;
}

const baseHat: object = {
  size: 0,
  color: "",
  name: "",
};

const baseSize: object = {
  inches: 0,
};

/**
 *  A Haberdasher makes hats for clients.
 */
export interface Haberdasher {

  /**
   *  MakeHat produces a hat of mysterious, randomly-selected color!
   */
  MakeHat(request: Size): Promise<Hat>;

}

export class HaberdasherClientImpl implements Haberdasher {

  private readonly rpc: Rpc;

  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }

  MakeHat(request: Size): Promise<Hat> {
    const data = Size.encode(request).finish();
    const promise = this.rpc.request("twitch.twirp.example.Haberdasher", "MakeHat", data);
    return promise.then(data => Hat.decode(new Reader(data)));
  }

}

interface Rpc {

  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;

}

export const protobufPackage = 'twitch.twirp.example'

export const Hat = {
  encode(message: Hat, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).int32(message.size);
    writer.uint32(18).string(message.color);
    writer.uint32(26).string(message.name);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): Hat {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseHat } as Hat;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.size = reader.int32();
          break;
        case 2:
          message.color = reader.string();
          break;
        case 3:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Hat {
    const message = { ...baseHat } as Hat;
    if (object.size !== undefined && object.size !== null) {
      message.size = Number(object.size);
    } else {
      message.size = 0;
    }
    if (object.color !== undefined && object.color !== null) {
      message.color = String(object.color);
    } else {
      message.color = "";
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = "";
    }
    return message;
  },
  fromPartial(object: DeepPartial<Hat>): Hat {
    const message = { ...baseHat } as Hat;
    if (object.size !== undefined && object.size !== null) {
      message.size = object.size;
    } else {
      message.size = 0;
    }
    if (object.color !== undefined && object.color !== null) {
      message.color = object.color;
    } else {
      message.color = "";
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = "";
    }
    return message;
  },
  toJSON(message: Hat): unknown {
    const obj: any = {};
    message.size !== undefined && (obj.size = message.size);
    message.color !== undefined && (obj.color = message.color);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },
};

export const Size = {
  encode(message: Size, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).int32(message.inches);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): Size {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseSize } as Size;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.inches = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Size {
    const message = { ...baseSize } as Size;
    if (object.inches !== undefined && object.inches !== null) {
      message.inches = Number(object.inches);
    } else {
      message.inches = 0;
    }
    return message;
  },
  fromPartial(object: DeepPartial<Size>): Size {
    const message = { ...baseSize } as Size;
    if (object.inches !== undefined && object.inches !== null) {
      message.inches = object.inches;
    } else {
      message.inches = 0;
    }
    return message;
  },
  toJSON(message: Size): unknown {
    const obj: any = {};
    message.inches !== undefined && (obj.inches = message.inches);
    return obj;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;