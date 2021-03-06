import * as React from 'react';
import { MdRefresh } from 'react-icons/md';
import { useNetworkClients } from './DeveloperToolsContext';
import { useAddError } from './ToastsContext';
import { ToolbarButton } from './ToolbarButton';

const { useState, useCallback } = React;

export function ResetButton() {
  const [disabled, setDisabled] = useState(false);
  const addError = useAddError();
  const { client, localClient } = useNetworkClients();
  const onClick = useCallback(() => {
    if (localClient !== undefined) {
      setDisabled(true);
      localClient
        .reset()
        .then(() => {
          client.reset();
          setDisabled(false);
        })
        .catch((error) => {
          addError(error);
          setDisabled(false);
        });
    }
  }, [client, localClient, setDisabled]);

  if (localClient === undefined) {
    // tslint:disable-next-line:no-null-keyword
    return null;
  }

  return (
    <ToolbarButton
      data-test-button="neo-one-reset-button"
      data-test-tooltip="neo-one-reset-tooltip"
      help="Reset Network"
      onClick={onClick}
      disabled={disabled}
    >
      <MdRefresh />
    </ToolbarButton>
  );
}
