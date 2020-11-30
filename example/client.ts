
import {HaberdasherClientImpl, Hat} from './generated/service'
import twirpProtobufClient from "../src";

const haberdasherClient = new HaberdasherClientImpl(twirpProtobufClient({
        url: "https://localhost:3000/twirp"
}))

haberdasherClient.MakeHat({inches: 12})
    .then((hat:Hat) => console.log(hat))
    .catch(error => console.log(error))

