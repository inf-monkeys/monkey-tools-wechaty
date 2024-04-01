import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { config } from './common/config';
import {
  ApiType,
  CredentialAuthType,
  ManifestJson,
  SchemaVersion,
} from './common/typings/manifest';

@Controller()
export class AppController {
  constructor() {}

  @Get('/healthz')
  @ApiExcludeEndpoint()
  public async healthz() {
    return {
      status: 'OK',
    };
  }

  @Get('/manifest.json')
  @ApiExcludeEndpoint()
  public getManifestJson(): ManifestJson {
    return {
      schema_version: SchemaVersion.v1,
      display_name: 'ComfyUI',
      namespace: 'monkey_tools_wechaty',
      auth: config.server.auth,
      api: {
        type: ApiType.openapi,
        url: `/openapi-json`,
      },
      contact_email: 'dev@inf-monkeys.com',
      credentials: [
        {
          trigger: true,
          name: 'wechaty-wechat',
          displayName: '微信',
          properties: [
            {
              name: 'qrcode',
              displayName: '请扫描二维码',
              type: 'qrcode' as any,
              typeOptions: {
                endpoints: {
                  gene: {
                    method: 'post',
                    url: '/wechaty/sessions',
                  },
                  check: {
                    method: 'get',
                    url: '/wechaty/sessions/{sessionId}',
                  },
                },
                extraData: {
                  puppet: 'wechaty-puppet-wechat',
                },
              },
              required: true,
            },
          ],
          logo: '',
          type: CredentialAuthType.QRCODE,
        },
      ],
    };
  }
}
