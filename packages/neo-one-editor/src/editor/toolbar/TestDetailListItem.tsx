// tslint:disable no-null-keyword
import * as React from 'react';
import { Grid, styled } from 'reakit';
import { prop } from 'styled-tools';
import { Test } from '../../types';
import { TestDetailError } from './TestDetailError';
import { TestIcon } from './TestIcon';
import { TestText } from './TestText';

const Wrapper = styled(Grid)`
  grid-gap: 0;
  grid-auto-flow: row;
  background-color: ${prop('theme.gray5')};
`;

const NameWrapper = styled(Grid)`
  grid-gap: 8px;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  justify-content: start;
`;

const HeaderWrapper = styled(Grid)`
  padding: 8px;
  grid-auto-flow: column;
  justify-items: space-between;
`;

const DurationWrapper = styled(Grid)`
  grid-gap: 8px;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  justify-content: end;
`;

interface Props {
  readonly test: Test;
}
export const TestDetailListItem = ({ test, ...props }: Props) => (
  <Wrapper data-test={`test-detail-list-item-${test.name.join('-')}`} {...props}>
    <HeaderWrapper>
      <NameWrapper>
        <TestIcon
          running={test.status === 'running'}
          failing={test.status === 'fail'}
          passing={test.status === 'pass'}
        />
        <TestText data-test="test-detail-list-item-text">{test.name.join(' > ')}</TestText>
      </NameWrapper>
      <DurationWrapper data-test="test-detail-list-item-duration">
        {test.status === 'pass' || test.status === 'fail' ? <TestText>{test.duration} ms</TestText> : <div />}
      </DurationWrapper>
    </HeaderWrapper>
    {test.status === 'fail' ? (
      <TestDetailError data-test="test-detail-list-item-error">{test.error}</TestDetailError>
    ) : null}
  </Wrapper>
);
