import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { config } from './common/config';
import {
  ApiType,
  ManifestJson,
  SchemaVersion,
  TriggerEndpointType,
} from './common/typings/manifest';
import { MessageType } from './common/typings/wechaty';

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
      triggerEndpoints: [
        {
          type: TriggerEndpointType.create,
          url: '/triggers',
          method: 'post',
        },
        {
          type: TriggerEndpointType.update,
          url: '/triggers/{triggerId}',
          method: 'put',
        },
        {
          type: TriggerEndpointType.delete,
          url: '/triggers/{triggerId}',
          method: 'delete',
        },
      ],
      triggers: [
        {
          type: 'wechaty-wechat',
          displayName: '微信消息',
          description: '通过微信消息触发工作流',
          icon: 'emoji:🤖:#f2c1be',
          properties: [
            {
              name: 'msgType',
              displayName: '消息类型',
              type: 'options',
              options: [
                {
                  name: 'Unknown',
                  value: MessageType.Unknown,
                },
                {
                  name: 'Attachment',
                  value: MessageType.Attachment,
                },
                {
                  name: 'Audio',
                  value: MessageType.Audio,
                },
                {
                  name: 'Contact',
                  value: MessageType.Contact,
                },
                {
                  name: 'ChatHistory',
                  value: MessageType.ChatHistory,
                },
                {
                  name: 'Emoticon',
                  value: MessageType.Emoticon,
                },
                {
                  name: 'Image',
                  value: MessageType.Image,
                },
                {
                  name: 'Text',
                  value: MessageType.Text,
                },
                {
                  name: 'Location',
                  value: MessageType.Location,
                },
                {
                  name: 'MiniProgram',
                  value: MessageType.MiniProgram,
                },
                {
                  name: 'GroupNote',
                  value: MessageType.GroupNote,
                },
                {
                  name: 'Transfer',
                  value: MessageType.Transfer,
                },
                {
                  name: 'RedEnvelope',
                  value: MessageType.RedEnvelope,
                },
                {
                  name: 'Recalled',
                  value: MessageType.Recalled,
                },
                {
                  name: 'Url',
                  value: MessageType.Url,
                },
                {
                  name: 'Video',
                  value: MessageType.Video,
                },
                {
                  name: 'Post',
                  value: MessageType.Post,
                },
              ],
              typeOptions: {
                multipleValues: true,
              },
            },
            {
              name: 'msgTalkerName',
              displayName: '消息发送人昵称',
              type: 'string',
              typeOptions: {
                multipleValues: true,
              },
            },
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
