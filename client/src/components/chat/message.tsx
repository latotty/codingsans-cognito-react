import * as React from 'react';

export const ChatMessage = (props) => {
  return (
    <div>
      <b>{props.from}</b>: {props.text} <span style={{ color: 'grey' }}>({props.when})</span>
    </div>
  );
};
