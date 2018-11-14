import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Grid, styled } from 'reakit';
import { ifProp, prop } from 'styled-tools';
import { TestSuite } from '../../types';
import { selectTestSuite } from '../redux';
import { FileText } from './FileText';
import { TestSuiteIcon } from './TestSuiteIcon';

const Wrapper = styled(Button)`
  cursor: pointer;
`;

const GridWrapper = styled(Grid)<{ readonly selected: boolean }>`
  grid-gap: 8px;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  align-items: center;
  justify-content: start;
  padding: 8px;
  background-color: ${prop('theme.gray5')};
  border-left: 2px solid ${ifProp('selected', prop('theme.accent'), prop('theme.gray5'))};
`;

interface ExternalProps {
  readonly selected: boolean;
  readonly testSuite: TestSuite;
}
interface Props extends ExternalProps {
  readonly onClick: () => void;
}
const TestSummaryListItemBase = ({ selected, testSuite, onClick, ...props }: Props) => (
  <Wrapper {...props} onClick={onClick} data-test={`test-summary-list-item-${testSuite.path}`}>
    <GridWrapper selected={selected}>
      <TestSuiteIcon testSuite={testSuite} />
      <FileText data-test="test-summary-list-item-file-text" path={testSuite.path} />
    </GridWrapper>
  </Wrapper>
);

export const TestSummaryListItem = connect(
  undefined,
  (dispatch, { testSuite }: ExternalProps) => ({
    onClick: () => dispatch(selectTestSuite(testSuite.path)),
  }),
)(TestSummaryListItemBase);
