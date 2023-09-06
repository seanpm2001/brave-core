// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'
import Alert from '@brave/leo/react/alert'
import Button from '@brave/leo/react/button'

// Utils
import { reduceAddress } from '../../../utils/reduce-address'
import {
  BlowfishWarningActionKind,
  BlowfishWarningSeverity,
  BraveWallet,
  SerializableSolanaTxData,
  SignDataSteps
} from '../../../constants/types'
import {
  translateEvmSimulationResultError //
} from '../../../utils/tx-simulation-utils'
import {
  getSolanaTransactionInstructionParamsAndType as getTypedSolTxInstruction
} from '../../../utils/solana-instruction-utils'
import { getLocale } from '../../../../common/locale'

// Hooks
import {
  useProcessSignSolanaTransaction,
  useSignSolanaTransactionsQueue
} from '../../../common/hooks/use_sign_solana_tx_queue'

// Components
import { SignTransactionFooter } from './common/footer'
import { TransactionOrigin } from './common/origin'
import { TransactionQueueSteps } from './common/queue'
import { TransactionSimulationInfo } from './transaction_simulation_info'
import { PanelTab } from '../panel-tab/index'
import { CopyTooltip } from '../../shared/copy-tooltip/copy-tooltip'
import { FullPanelPopup } from '../full_panel_popup/full_panel_popup'
import NavButton from '../buttons/nav-button'
import {
  LoadingSimulation //
} from '../enable_transaction_simulations/enable_transaction_simulations'

// Styled Components
import { Column, ErrorText, FullWidth, Text } from '../../shared/style'
import {
  LearnMoreButton,
  TabRow,
  WarningBox,
  WarningIcon,
  WarningText,
  WarningTitle
} from '../shared-panel-styles'
import {
  ButtonRow,
  StyledWrapper,
  TopRow,
  WarningTitleRow,
} from '../sign-panel/style'
import {
  AccountNameAndAddress,
  CriticalWarningIcon,
  NetworkNameText,
  WarningCollapse,
  WarningTriangleFilledIcon,
  OriginRow,
  SimulationInfoColumn
} from './confirm_simulated_tx_panel.styles'
import {
  FullWidthChildrenColumn,
  LargeWarningCircleIcon,
  MessageBox,
  WarningButtonText,
  WarningsList
} from './style'
import { DetailColumn } from '../transaction-box/style'
import {
  SolanaTransactionInstruction
} from '../../shared/solana-transaction-instruction/solana-transaction-instruction'

type confirmPanelTabs = 'transaction' | 'details'

type Props = {
  txSimulation: BraveWallet.SolanaSimulationResponse
  signMode: Parameters<typeof useSignSolanaTransactionsQueue>[0]
  isSigningDisabled: boolean
  network: BraveWallet.NetworkInfo
  queueNextSignTransaction: () => void
  selectedQueueData: BraveWallet.SignTransactionRequest
    | BraveWallet.SignAllTransactionsRequest
    | undefined
  txDatas: SerializableSolanaTxData[] | BraveWallet.SolanaTxData[]
  signingAccount?: BraveWallet.AccountInfo
  queueLength: number
  queueNumber: number
}

// TODO: fix broken article link
const onClickLearnMore = () => {
  window.open(
    'https://support.brave.com/hc/en-us/articles/4409513799693',
    '_blank',
    'noreferrer'
  )
}

/**
 * For Solana transaction signature requests
 */
export const SignSimulatedTransactionPanel = ({
  network,
  queueLength,
  queueNextSignTransaction,
  queueNumber,
  selectedQueueData,
  signingAccount,
  signMode,
  txDatas,
  txSimulation,
}: Props) => {
  // custom hooks
  const {
    cancelSign: onCancelSign,
    sign: onSign
  } = useProcessSignSolanaTransaction({
    signMode,
    request: selectedQueueData
  })

  // state
  const originInfo = selectedQueueData?.originInfo
  const [signStep, setSignStep] = React.useState<SignDataSteps>(
    SignDataSteps.SignRisk
  )
  const [isCriticalWarningPopupOpen, setIsCriticalWarningPopupOpen] =
    React.useState<boolean>(
      (txSimulation.action as BlowfishWarningActionKind) === 'BLOCK'
    )
  const [selectedTab, setSelectedTab] =
    React.useState<confirmPanelTabs>('transaction')
  const [isWarningCollapsed, setIsWarningCollapsed] =
    React.useState<boolean>(true)

  // memos
  const simulationResultsErrorText = React.useMemo(() => {
    return translateEvmSimulationResultError(
      txSimulation?.simulationResults.error
    )
  }, [txSimulation?.simulationResults.error])

  // memos
  const hasCriticalWarnings = React.useMemo(() => {
    return txSimulation.warnings.some(
      (warning) =>
        (warning.severity as BlowfishWarningSeverity) === 'CRITICAL'
    )
  }, [txSimulation.warnings])

  // methods
  const onSelectTab = React.useCallback(
    (tab: confirmPanelTabs) => () => setSelectedTab(tab),
    []
  )

  const onAcceptSigningRisks = React.useCallback(() => {
    setSignStep(SignDataSteps.SignData)
  }, [])

  // render
  if (
    !txSimulation ||
    !network ||
    !selectedQueueData
  ) {
    return <LoadingSimulation />
  }

  // Critical Warning pop-up
  if (isCriticalWarningPopupOpen) {
    return (
      <FullPanelPopup
        onClose={() => setIsCriticalWarningPopupOpen(false)}
        kind='danger'
      >
        <Column fullHeight fullWidth gap={'8px'} justifyContent='space-between'>
          <Column fullWidth gap={'8px'} padding={'40px 40px 40px 40px'}>
            <LargeWarningCircleIcon />

            {/* TODO: style */}
            <Text isBold textSize='14px' style={{ lineHeight: '24px' }}>
            {/* TODO: locale */}
              Unsafe action with risk of loss
            </Text>

            {/* TODO: locale, style */}
            <Text textSize='12px' style={{ lineHeight: '18px' }}>
              This request appears unstable or malicious, and may leave you
              vulnerable to theft. Do not continue unless you trust the app.
            </Text>
          </Column>

          <FullWidthChildrenColumn fullWidth padding={'16px'} gap={'16px'}>
            <Button
              kind='outline'
              onClick={() => setIsCriticalWarningPopupOpen(false)}
            >
              <WarningButtonText>
                {/* TODO: locale */}
                Proceed
              </WarningButtonText>
            </Button>
            <Button kind='filled' onClick={onCancelSign}>
              {/* TODO: locale */}
              Cancel
            </Button>
          </FullWidthChildrenColumn>
        </Column>
      </FullPanelPopup>
    )
  }

  return (
    <StyledWrapper>
      <TopRow>
        <Column alignItems='flex-start' gap={'4px'}>
          <NetworkNameText>{network?.chainName ?? ''}</NetworkNameText>
          <AccountNameAndAddress>
            <CopyTooltip
              isAddress
              text={signingAccount?.address}
              tooltipText={signingAccount?.address}
            >
              {signingAccount?.name ?? ''}{' '}
              {reduceAddress(signingAccount?.address || '') ?? ''}
            </CopyTooltip>
          </AccountNameAndAddress>
        </Column>
        <TransactionQueueSteps
          queueNextTransaction={queueNextSignTransaction}
          transactionQueueNumber={queueNumber}
          transactionsQueueLength={queueLength}
        />
      </TopRow>

      <>
        {signStep === SignDataSteps.SignRisk ? (
          <>
            <WarningBox warningType='danger'>
              <WarningTitleRow>
                <WarningIcon />
                <WarningTitle warningType='danger'>
                  {getLocale('braveWalletSignWarningTitle')}
                </WarningTitle>
              </WarningTitleRow>
              <WarningText>{getLocale('braveWalletSignWarning')}</WarningText>
              <LearnMoreButton onClick={onClickLearnMore}>
                {getLocale('braveWalletAllowAddNetworkLearnMoreButton')}
              </LearnMoreButton>
            </WarningBox>
            <ButtonRow>
              <NavButton
                buttonType='secondary'
                text={getLocale('braveWalletButtonCancel')}
                onSubmit={onCancelSign}
              />
              <NavButton
                buttonType={'danger'}
                text={getLocale('braveWalletButtonContinue')}
                onSubmit={onAcceptSigningRisks}
              />
            </ButtonRow>
          </>
        ) : (
          <>
            {originInfo && (
              <OriginRow>
                <TransactionOrigin originInfo={originInfo} />
              </OriginRow>
            )}

            <TabRow>
              <PanelTab
                isSelected={selectedTab === 'transaction'}
                onSubmit={onSelectTab('transaction')}
                text='Transaction'
              />
              <PanelTab
                isSelected={selectedTab === 'details'}
                onSubmit={onSelectTab('details')}
                text='Details'
              />
            </TabRow>

            <SimulationInfoColumn>
              {isWarningCollapsed && (
                <>
                  {selectedTab === 'transaction' ? (
                    simulationResultsErrorText ? (
                      <MessageBox isDetails={true} isApprove={false}>
                        <ErrorText>{simulationResultsErrorText}</ErrorText>
                      </MessageBox>
                    ) : txSimulation && network ? (
                      <TransactionSimulationInfo
                        key={'SolanaSimulationInfo'}
                        simulation={txSimulation}
                        simulationType={'SVM'}
                        network={network}
                      />
                    ) : null
                  ) : (
                    <MessageBox isApprove={false} isDetails={true}>
                      {txDatas.map(({ instructions, txType }, i) => {
                        return (
                          <DetailColumn key={`${txType}-${i}`}>
                            {instructions?.map((instruction, index) => {
                              return (
                                <SolanaTransactionInstruction
                                  key={index}
                                  typedInstructionWithParams={
                                    //
                                    getTypedSolTxInstruction(instruction)
                                  }
                                />
                              )
                            })}
                          </DetailColumn>
                        )
                      })}
                    </MessageBox>
                  )}
                </>
              )}
            </SimulationInfoColumn>

            {txSimulation.warnings.length > 0 ? (
              <FullWidth>
                {txSimulation.warnings.length > 1 ? (
                  <WarningCollapse
                    isOpen={!isWarningCollapsed}
                    isCritical={hasCriticalWarnings}
                    onToggle={() => setIsWarningCollapsed((prev) => !prev)}
                    title={
                      // TODO: locale
                      hasCriticalWarnings
                        ? 'Unsafe action with risk of loss'
                        : `We found ${txSimulation.warnings.length} issue(s).`
                    }
                  >
                    <div slot='icon'>
                      {hasCriticalWarnings ? (
                        <CriticalWarningIcon />
                      ) : (
                        <WarningTriangleFilledIcon />
                      )}
                    </div>

                    <WarningsList>
                      {txSimulation.warnings.map((warning, i) => (
                        <li key={warning.message}>{warning.message}</li>
                      ))}
                    </WarningsList>
                  </WarningCollapse>
                ) : (
                  <>
                    <Alert
                      mode='simple'
                      type={
                        (txSimulation.warnings[0]
                          .severity as BlowfishWarningSeverity) === 'CRITICAL'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {txSimulation.warnings[0].message}
                    </Alert>
                  </>
                )}
              </FullWidth>
            ) : null}

            <SignTransactionFooter onConfirm={onSign} onReject={onCancelSign} />
          </>
        )}
      </>
    </StyledWrapper>
  )
}

export default SignSimulatedTransactionPanel
