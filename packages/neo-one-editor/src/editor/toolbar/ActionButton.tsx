// tslint:disable no-null-keyword
import { Container, EffectMap } from 'constate';
import * as React from 'react';
import { EditorContext } from '../../EditorContext';
import { MainEngine } from '../../engine/main';
import { EditorContextType } from '../../types';
import { ActionButtonBase } from './ActionButtonBase';

interface State {
  readonly loading: boolean;
}

interface Effects {
  readonly onClick: () => void;
}

interface Props {
  readonly text: string;
  readonly icon: React.ReactNode;
  readonly makeEffects: (engine: MainEngine) => EffectMap<State, Effects>;
}

export const ActionButton = ({ text, makeEffects, icon, ...props }: Props) => (
  <EditorContext.Consumer>
    {({ engine }: EditorContextType) => (
      <Container initialState={{ loading: false }} effects={makeEffects(engine)}>
        {({ onClick, loading }) => (
          <ActionButtonBase {...props} onClick={onClick} loading={loading} text={text} icon={icon} />
        )}
      </Container>
    )}
  </EditorContext.Consumer>
);
