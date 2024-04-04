import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { config } from './common/config';
import {
  ApiType,
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
      triggerEndpoint: {
        url: '/triggers',
        method: 'post',
      },
      triggers: [
        {
          type: 'wechaty-wechat',
          displayName: '微信消息触发',
          description: '通过微信消息触发工作流',
          icon: 'emoji:🤖:#f2c1be',
          properties: [
            {
              name: 'sessionId',
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
        },
      ],
    };
  }
}
