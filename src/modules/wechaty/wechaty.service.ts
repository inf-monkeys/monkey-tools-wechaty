import { logger } from '@/common/logger';
import { sleep } from '@/common/utils';
import {
  WechatySessionEntity,
  WechatySessionStatus,
} from '@/database/entities/wechaty-session.entity';
import { WechatyRepository } from '@/database/repostories/wechaty-session.repository';
import { TriggerRepository } from '@/database/repostories/wechaty-trigger.repository';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import fs from 'fs';
import { Contact, Message, ScanStatus, WechatyBuilder, log } from 'wechaty';

@Injectable()
export class WechatyService {
  constructor(
    private readonly wechatyRepository: WechatyRepository,
    private readonly triggerRepository: TriggerRepository,
  ) {}

  private getMemoryCardFile(sessionId: string) {
    return `./${sessionId}.memory-card.json`;
  }

  private async filterUselessMsg(msg: Message) {
    const msgContext = msg.text();
    if (!msgContext) {
      return false;
    }
    if (msg.self()) {
      return false;
    }
    return true;
  }

  private async triggerWorkflow(sessionId: string, msg: Message) {
    const msgId = msg.id;
    const msgType = msg.type();
    const msgFrom = msg.talker();
    const msgTalkerName = msg.talker().name();
    const msgTalkerId = msg.talker().id;
    const msgContext = msg.text();
    if (!msgContext) {
      return;
    }
    const trigger =
      await this.triggerRepository.getTriggerBySessionId(sessionId);
    if (!trigger) {
      return;
    }
    const {
      triggerEndpoint,
      msgType: filterMsgType,
      msgTalkerName: filterMsgTalkerNames,
    } = trigger;
    if (filterMsgType != msgType) {
      logger.info(`Msg type not match, discard`);
      return;
    }
    if (!filterMsgTalkerNames.includes(msgTalkerName)) {
      logger.info(`Msg msgTalkerName not match, discard`);
      return;
    }
    try {
      const { data } = await axios.post(triggerEndpoint, {
        msgId,
        msgType,
        msgFrom,
        msgContext,
        msgTalkerName,
        msgTalkerId,
        // wait workflow finish to get response
        sync: true,
      });
      logger.info(`Trigegr ${trigger.triggerId} start workflow success`, data);
      return data;
    } catch (error) {
      logger.error(
        `Trigegr ${trigger.triggerId} start workflow failed`,
        error.message,
      );
    }
  }

  private async runWechatySession(sessionId: string) {
    const onScan = async (qrcode: string, status: ScanStatus) => {
      if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        const qrcodeImageUrl = [
          'https://wechaty.js.org/qrcode/',
          encodeURIComponent(qrcode),
        ].join('');
        log.info(
          'WechatyBot',
          'onScan: %s(%s) - %s',
          ScanStatus[status],
          status,
          qrcodeImageUrl,
        );
        await this.wechatyRepository.updateSession({
          sessionId,
          status: WechatySessionStatus.PENDING_SCAN,
          qrcodeUrl: qrcodeImageUrl,
        });
      } else {
        log.info('WechatyBot', 'onScan: %s(%s)', ScanStatus[status], status);
      }
    };

    const onLogin = async (user: Contact) => {
      log.info('WechatyBot', '%s login', user);
      const memoryCardJsonFile = this.getMemoryCardFile(sessionId);
      const timeout = 10;
      const start = +new Date();
      while (true) {
        if (
          fs.existsSync(memoryCardJsonFile) &&
          fs.readFileSync(memoryCardJsonFile, 'utf-8')
        ) {
          break;
        }
        if (+new Date() - start >= timeout * 1000) {
          break;
        }
        await sleep(1000);
      }

      const memoryCard = fs.readFileSync(memoryCardJsonFile, 'utf-8');
      await this.wechatyRepository.updateSession({
        sessionId,
        status: WechatySessionStatus.LOGGED_IN,
        memoryCard,
      });
    };

    const onLogout = async (user: Contact) => {
      log.info('WechatyBot: onLogout', '%s logout', user);
      await this.wechatyRepository.updateSession({
        sessionId,
        status: WechatySessionStatus.LOGGED_IN,
      });
    };

    const onMessage = async (msg: Message) => {
      log.info(
        `WechatyBot onMessage: message_id=${msg.id}, message_type=${msg.type()}, message_from=${msg.talker().name()}, message_content=${msg.text()}`,
      );
      if (this.filterUselessMsg(msg)) {
        const response = await this.triggerWorkflow(sessionId, msg);
        if (response) {
          await msg.say(response.response);
        }
      }
    };

    const bot = WechatyBuilder.build({
      name: sessionId,
      puppetOptions: {
        uos: true,
      },
      // puppet,
      /**
         * You can specific `puppet` and `puppetOptions` here with hard coding:
         *
        puppetOptions: {
          uos: true,
        },
        */
      /**
       * How to set Wechaty Puppet Provider:
       *
       *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-whatsapp' }`, see below)
       *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-whatsapp`)
       *
       * You can use the following providers locally:
       *  - wechaty-puppet-wechat (web protocol, no token required)
       *  - wechaty-puppet-whatsapp (web protocol, no token required)
       *  - wechaty-puppet-padlocal (pad protocol, token required)
       *  - etc. see: <https://wechaty.js.org/docs/puppet-providers/>
       */
      // puppet: 'wechaty-puppet-whatsapp'

      /**
       * You can use wechaty puppet provider 'wechaty-puppet-service'
       *   which can connect to remote Wechaty Puppet Services
       *   for using more powerful protocol.
       * Learn more about services (and TOKEN) from https://wechaty.js.org/docs/puppet-services/
       */
      // puppet: 'wechaty-puppet-service'
      // puppetOptions: {
      //   token: 'xxx',
      // }
    });

    bot.on('scan', onScan);
    bot.on('login', onLogin);
    bot.on('logout', onLogout);
    bot.on('message', onMessage);

    bot
      .start()
      .then(async () => {
        log.info('WechatyBot', 'Starter Bot Started.');
      })
      .catch((e) => log.error('WechatyBot', e));
  }

  public async initSession(
    teamId: string,
    userId: string,
    puppet: string,
  ): Promise<[boolean, WechatySessionEntity]> {
    const [created, session] =
      await this.wechatyRepository.createSessionIfNoeExists({
        teamId,
        userId,
        puppet,
      });
    if (created) {
      await this.runWechatySession(session.sessionId);
    }
    return [created, session];
  }

  public async getSession(sessionId: string) {
    return await this.wechatyRepository.getSession(sessionId);
  }

  public async waitForQrcodeGenerated(
    sessionId: string,
    timeout: number = 60000,
  ) {
    const start = +new Date();
    while (true) {
      const session = await this.wechatyRepository.getSession(sessionId);
      if (session.status === WechatySessionStatus.PENDING_SCAN) {
        return session.qrcodeUrl;
      }
      if (+new Date() - start >= timeout) {
        throw new Error('Generate qrcode timeout');
      }
      await sleep(500);
    }
  }

  public async runExistingSessionsOnStartup() {
    const startupTimestamp = +new Date();
    while (true) {
      const session =
        await this.wechatyRepository.findOneValidSession(startupTimestamp);
      if (!session) {
        break;
      }
      logger.info(`Start pre exist session: ${session.sessionId}`);
      const memoryCardJsonFile = this.getMemoryCardFile(session.sessionId);
      fs.writeFileSync(memoryCardJsonFile, session.memoryCard);
      await this.runWechatySession(session.sessionId);
      await sleep(200);
    }
  }
}
