import * as React from 'react';

import { ChatMessage } from './message';
import { getClient, GLOBAL_CHAT_OUT_TOPIC } from '../mqtt/mqtt';

export interface IMessage {
  id: number;
  from: string;
  when: string;
  text: string;
}

interface IState {
  messages: IMessage[];
}

export class ChatMessages extends React.Component<undefined, IState> {
  // TODO cleanup mqtt client when detaching

  constructor() {
    super();

    getClient().then((client) => {
      client.on('message', (topic, messageBuffer) => {
        if (topic !== GLOBAL_CHAT_OUT_TOPIC) {
          console.error('messages > invalid topic', topic);
          return client.end();
        }

        const message = messageBuffer.toString();
        console.log('messages > arrived', message);

        this.setState({
          messages: [...this.state.messages, message]
        });
        return client.end();
      });
    });

    this.state = {
      messages: [
        {
          id: 1,
          from: 'Topo',
          when: new Date(0).toJSON(),
          text: 'Oi mate',
        },
        {
          id: 2,
          from: 'Keko',
          when: new Date().toJSON(),
          text: 'Speak',
        },
      ],
    };
  }

  render() {
    const messages = this.state.messages;
    return (
      <div>
        {messages.map((message) =>
          <ChatMessage key={message.id} from={message.from} when={message.when} text={message.text} />
        )}
      </div>
    );
  }
}
