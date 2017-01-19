import * as mqtt from 'mqtt';

import { getSignUrl } from '../http/http';
import { IMessage } from '../chat/messages';

const GLOBAL_CHAT_IN_TOPIC = 'globalChatIn';
export const GLOBAL_CHAT_OUT_TOPIC = 'globalChatOut';

let client;
export function getClient() {
  if (client) {
    return Promise.resolve(client);
  }

  return getSignUrl().then(signedUrl => {
    client = mqtt.connect(signedUrl);

    return new Promise((resolve, reject) => {
      client.on('connect', () => {
        client.subscribe(GLOBAL_CHAT_OUT_TOPIC, (err) => {
          if (err) {
            console.error('mqtt > subscribe > error', err);
            return reject(err);
          }
          console.log('mqtt > subscribe > done');
          return resolve(client);
        });
      });
    });
  });
}

export function publish(message: IMessage) {
  return getClient().then(cli => {
    return new Promise((resolve, reject) => {
      cli.publish(GLOBAL_CHAT_IN_TOPIC, JSON.stringify(message), (err) => {
        if (err) {
          console.error('mqtt > publish > error', err);
          return reject(err);
        }
        console.log('mqtt > publish > done');
        return resolve();
      });
    });
  });
}
