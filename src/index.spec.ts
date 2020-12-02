import axios, { AxiosError } from 'axios';
import twirpProtobufClient, { TwirpError, TwirpErrorCode } from './index';
import nock, { Body } from 'nock';

const mockServiceUrl = 'https://example.com/twirp';
const client = twirpProtobufClient({ url: mockServiceUrl });

const requestData = Buffer.from('request-data');
const responseData = Buffer.from('response-data');

describe('TwirpProtobufClient', () => {
  afterAll(() => {
    nock.restore();
  });

  test('requests twirp service correctly', async () => {
    const scope = nock(mockServiceUrl)
      .post('/twitch.twirp.example.Haberdasher/MakeHat', requestData)
      .reply(200, responseData);

    scope.on('request', (req) => {
      expect(req['headers']['accept']).toEqual('application/protobuf,application/json');
      expect(req['headers']['content-type']).toEqual('application/protobuf');
      expect(req['requestBodyBuffers'][0]).toEqual(requestData);
    });

    await expect(client.request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)).resolves.toEqual(
      responseData
    );
  });

  test('passes through correct header configuration', async () => {
    const configuredClient = twirpProtobufClient({
      url: mockServiceUrl,
      headers: {
        'x-example-header': 'test',
      },
      auth: {
        username: 'username',
        password: 'password',
      },
    });

    const scope = nock(mockServiceUrl)
      .post('/twitch.twirp.example.Haberdasher/MakeHat', requestData)
      .reply(200, responseData);

    scope.on('request', (req) => {
      // expect(req['headers']['authorization']).toEqual('Basic dXNlcm5hbWU6cGFzc3dvcmQ=')
      expect(req['headers']['x-example-header']).toEqual('test');
      expect(req['headers']['content-type']).toEqual('application/protobuf');
      expect(req['headers']['accept']).toEqual('application/protobuf,application/json');
    });

    await expect(configuredClient.request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)).resolves.toEqual(
      responseData
    );
  });

  test('correctly sets timeout, and throws a timeout error', async () => {
    const configuredClient = twirpProtobufClient({
      url: mockServiceUrl,
      timeout: 250,
    });

    const scope = nock(mockServiceUrl)
      .post('/twitch.twirp.example.Haberdasher/MakeHat', requestData)
      .delay(500)
      .reply(200, responseData);

    await expect(
      configuredClient.request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)
    ).rejects.toBeInstanceOf(Error);
  });

  test('correctly maps invalid_argument twirp error', async () => {
    const scope = nock(mockServiceUrl).post('/twitch.twirp.example.Haberdasher/MakeHat', requestData).reply(400, {
      code: 'invalid_argument',
      msg: 'field is required',
    });

    await client
      .request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)
      .then(() => fail('should throw an exception'))
      .catch((error: TwirpError) => {
        expect(error).toBeInstanceOf(TwirpError);
        expect(error.code).toEqual(TwirpErrorCode.InvalidArgument);
        expect(error.msg).toEqual('field is required');
      });
  });

  test('correctly maps meta data for twirp errors', async () => {
    const scope = nock(mockServiceUrl)
      .post('/twitch.twirp.example.Haberdasher/MakeHat', requestData)
      .reply(412, {
        code: 'failed_precondition',
        msg: 'precondition failed',
        meta: {
          nested: 'data',
        },
      });

    await client
      .request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)
      .then(() => fail('should throw an exception'))
      .catch((error: TwirpError) => {
        expect(error).toBeInstanceOf(TwirpError);
        expect(error.code).toEqual(TwirpErrorCode.FailedPrecondition);
        expect(error.meta).toEqual({
          nested: 'data',
        });
      });
  });

  test('falls back to http status code when no error code is provided', async () => {
    const scope = nock(mockServiceUrl)
      .post('/twitch.twirp.example.Haberdasher/MakeHat', requestData)
      .reply(412, {
        msg: 'precondition failed',
        meta: {
          nested: 'data',
        },
      });

    await client
      .request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)
      .then(() => fail('should throw an exception'))
      .catch((error: TwirpError) => {
        expect(error).toBeInstanceOf(TwirpError);
        expect(error.code).toEqual(TwirpErrorCode.FailedPrecondition);
        expect(error.meta).toEqual({
          nested: 'data',
        });
      });
  });

  test('handles an empty error response', async () => {
    const scope = nock(mockServiceUrl).post('/twitch.twirp.example.Haberdasher/MakeHat', requestData).reply(412);

    await client
      .request('twitch.twirp.example.Haberdasher', 'MakeHat', requestData)
      .then(() => fail('should throw an exception'))
      .catch((error: TwirpError) => {
        expect(error).toBeInstanceOf(TwirpError);
        expect(error.code).toEqual(TwirpErrorCode.FailedPrecondition);
      });
  });
});
