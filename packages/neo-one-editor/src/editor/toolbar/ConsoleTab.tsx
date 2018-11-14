import * as React from 'react';
import { Box, Button, Grid, styled } from 'reakit';
import { ifProp, prop, withProp } from 'styled-tools';

const ButtonWrapper = styled(Button)`
  padding: 8px;
  cursor: pointer;
  outline: none;
`;

const Wrapper = styled(Grid)`
  align-items: start;
  gap: 4px;
  grid-auto-flow: column;
`;

const TextWrapper = styled(Box)`
  color: ${ifProp('selected', prop('theme.gray0'), prop('theme.gray2'))};
  ${prop('theme.fonts.axiformaRegular')};
  ${prop('theme.fontStyles.body1')};
  /* stylelint-disable-next-line */
  border-bottom: ${ifProp(
    'selected',
    withProp('theme.gray0', (color) => `1px solid ${color}`),
    '1px solid transparent',
  )};

  &:hover {
    color: ${prop('theme.gray0')};
  }
`;

interface Props {
  readonly onClick: () => void;
  readonly text: string;
  readonly children?: React.ReactNode;
  readonly selected: boolean;
}

export const ConsoleTab = ({ text, onClick, selected, children, ...props }: Props) => (
  <ButtonWrapper onClick={onClick} {...props}>
    <Wrapper>
      <TextWrapper selected={selected}>{text}</TextWrapper>
      {children}
    </Wrapper>
  </ButtonWrapper>
);
