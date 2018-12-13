import { Box } from '@neo-one/react-common';
import * as React from 'react';
import styled from 'styled-components';
import { prop } from 'styled-tools';
import { Example, Text, Title } from '../common';
import { Method } from '../types';
import { ParameterReturns } from './ParameterReturns';

export interface Props {
  readonly method: Method;
}

const Layout = styled(Box)`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 16px;
  background-color: ${prop('theme.gray1')};
  border: 1px solid rgba(0, 0, 0, 0.3);

  @media (max-width: ${prop('theme.breakpoints.md')}) {
    grid-gap: 8px;
  }
`;

const Wrapper = styled(Box)`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 16px;
  padding: 16px 32px;

  @media (max-width: ${prop('theme.breakpoints.md')}) {
    grid-gap: 8px;
  }
`;

const StyledTitle = styled(Title)`
  background-color: ${prop('theme.gray1')};
  padding: 16px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;

export const MethodItem = ({ method, ...props }: Props) => (
  <Layout {...props}>
    <StyledTitle subheading>{method.title}</StyledTitle>
    <Wrapper>
      {method.description === undefined ? undefined : <Text text={method.description} />}
      <Example example={method.definition} />
      <ParameterReturns functionData={method.functionData} subheading />
    </Wrapper>
  </Layout>
);
