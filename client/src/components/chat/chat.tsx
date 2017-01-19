import * as React from 'react';

import { ChatMessages } from './messages';
import { ChatInput } from './input';

export class Chat extends React.Component<any, undefined> {
  render() {
    return (
      <div>
        <ChatMessages />
        <br/>
        <ChatInput />
      </div>
    );
  }
}
