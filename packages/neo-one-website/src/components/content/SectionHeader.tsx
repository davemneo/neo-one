import * as React from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { Button, styled } from 'reakit';
import { prop } from 'styled-tools';

interface Props {
  readonly title: string;
  readonly visible: boolean;
  readonly toggle?: () => void;
}

const SectionButton = styled(Button)`
  ${prop('theme.fonts.axiformaBold')};
  ${prop('theme.fontStyles.subheading')};
  line-height: 3;
  outline: none;
  cursor: pointer;
`;

export const SectionHeader = ({ title, visible, toggle, ...props }: Props) => (
  <SectionButton {...props} onClick={toggle}>
    {title.toUpperCase()}
    {visible ? <MdExpandLess /> : <MdExpandMore />}
  </SectionButton>
);
