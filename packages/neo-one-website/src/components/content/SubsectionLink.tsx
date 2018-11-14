// tslint:disable no-null-keyword
import { Link as ReactLink } from '@neo-one/react-common';
import * as React from 'react';
import { as, styled } from 'reakit';
import { ifProp, prop } from 'styled-tools';
import { RouterLink } from '../RouterLink';

const Link = styled(as(RouterLink)(ReactLink))<{ readonly active: boolean }>`
  ${ifProp('active', prop('theme.fonts.axiformaBold'), prop('theme.fonts.axiformaRegular'))};
  ${prop('theme.fontStyles.subheading')};

  &:hover {
    color: ${prop('theme.accent')};
  }

  &:focus {
    color: ${prop('theme.accent')};
  }

  &.active {
    color: ${prop('theme.accent')};
  }
`;
const ActiveBorder = styled.span`
  width: 4px;
  height: 24px;
  border-left: 4px solid ${prop('theme.accent')};
  padding-left: 16px;
  position: absolute;
  left: -16px;
`;

const Wrapper = styled.li``;

interface Props {
  readonly active: boolean;
  readonly title: string;
  readonly slug: string;
  readonly index?: number;
  readonly onClick?: () => void;
  readonly children?: React.ReactNode;
}

export const SubsectionLink = ({ active, title, index, slug, children, onClick, ...props }: Props) => (
  <Wrapper {...props}>
    <Link active={active} linkColor="gray" to={slug} onClick={onClick}>
      {active ? <ActiveBorder /> : null}
      {index === undefined ? title : `${index}. ${title}`}
    </Link>
    {children}
  </Wrapper>
);
