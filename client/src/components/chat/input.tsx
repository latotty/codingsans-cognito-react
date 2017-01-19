import * as React from 'react';

import { publish } from '../mqtt/mqtt';
import { IMessage } from './messages';

export class ChatInput extends React.Component<any, undefined> {
  messageInput: HTMLInputElement;

  constructor() {
    super();
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    const message = this.messageInput.value;
    if (!message) {
      return;
    }
    console.log('chat input > sendMessage', message);
    const messageObject: IMessage = {
      from: 'Dude',
      when: new Date().toJSON(),
      text: message,
      id: 1,
    };
    return publish(messageObject).then(() => {
      this.messageInput.value = '';
    });
  }

  render() {
    return (
      <div>
        <input ref={(input) => this.messageInput=input} type="text" placeholder="Enter message" />
        <button onClick={this.sendMessage}>Send</button>
      </div>
    );
  }
}
