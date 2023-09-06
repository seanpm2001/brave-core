// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import Alert from '@brave/leo/react/alert'
import Button from '@brave/leo/react/button'

// Types
import {
  BlowfishWarningActionKind,
  BlowfishWarningSeverity,
  BraveWallet,
  SafeBlowfishEvmResponse,
  SafeBlowfishSolanaResponse
} from '../../../constants/types'

// Utils
import { reduceAddress } from '../../../utils/reduce-address'
import { WalletSelectors } from '../../../common/selectors'
import {
  isUrlWarning,
  translateEvmSimulationResultError //
} from '../../../utils/tx-simulation-utils'

// Hooks
import {
  usePendingTransactions //
} from '../../../common/hooks/use-pending-transaction'
import { useExplorer } from '../../../common/hooks/explorer'
import {
  useGetAddressByteCodeQuery //
} from '../../../common/slices/api.slice'
import { useAccountQuery } from '../../../common/slices/api.slice.extra'
import {
  useUnsafeWalletSelector //
} from '../../../common/hooks/use-safe-selector'

// Components
import { AdvancedTransactionSettings } from '../advanced-transaction-settings'
import { EditAllowance } from '../edit-allowance/index'
import { EditPendingTransactionGas } from './common/gas'
import { Footer } from './common/footer'
import { TransactionOrigin } from './common/origin'
import { PanelTab } from '../panel-tab/index'
import { TransactionDetailBox } from '../transaction-box/index'
import { TransactionQueueSteps } from './common/queue'
import { TransactionSimulationInfo } from './transaction_simulation_info'
import {
  PendingTransactionNetworkFeeAndSettings //
} from '../pending-transaction-network-fee/pending-transaction-network-fee'
import {
  AdvancedTransactionSettingsButton //
} from '../advanced-transaction-settings/button'
import {
  LoadingSimulation //
} from '../enable_transaction_simulations/enable_transaction_simulations'
import CopyTooltip from '../../shared/copy-tooltip/copy-tooltip'
import FullPanelPopup from '../full_panel_popup/full_panel_popup'

// Styled Components
import { Column, ErrorText, FullWidth, Row, Text } from '../../shared/style'
import { TabRow } from '../shared-panel-styles'
import { NetworkFeeRow } from './common/style'
import {
  StyledWrapper,
  MessageBox,
  WarningsList,
  LargeWarningCircleIcon,
  FullWidthChildrenColumn,
  WarningButtonText,
} from './style'
import {
  AccountNameAndAddress,
  CriticalWarningIcon,
  NetworkNameText,
  WarningCollapse,
  WarningTriangleFilledIcon,
  OriginRow,
  SimulationInfoColumn,
  TabsAndContent,
} from './confirm_simulated_tx_panel.styles'

type confirmPanelTabs = 'transaction' | 'details'

type Props =
  | {
      simulationType: 'EVM'
      txSimulation: BraveWallet.EVMSimulationResponse | SafeBlowfishEvmResponse
    }
  | {
      simulationType: 'SVM'
      txSimulation: BraveWallet.SolanaSimulationResponse
        | SafeBlowfishSolanaResponse
    }

/**
 * @returns For EVM & Solana transactions
 */
export const ConfirmSimulatedTransactionPanel = ({
  txSimulation,
  simulationType
}: Props) => {
  // redux
  const activeOrigin = useUnsafeWalletSelector(WalletSelectors.activeOrigin)

  // custom hooks
  const {
    isERC20Approve,
    isSolanaTransaction,
    onEditAllowanceSave,
    transactionDetails,
    transactionsNetwork,
    updateUnapprovedTransactionNonce,
    selectedPendingTransaction,
    onReject,
    queueNextTransaction,
    transactionQueueNumber,
    transactionsQueueLength,
  } = usePendingTransactions()

  const onClickViewOnBlockExplorer = useExplorer(transactionsNetwork)

  // queries
  const { data: byteCode, isLoading } = useGetAddressByteCodeQuery(
    transactionDetails
      ? {
          address: transactionDetails.recipient ?? '',
          coin: transactionDetails.coinType ?? -1,
          chainId: transactionDetails.chainId ?? ''
        }
      : skipToken
  )
  const { account: fromAccount } = useAccountQuery(
    selectedPendingTransaction?.fromAccountId ?? skipToken
  )

  // computed
  const isContract = !isLoading && byteCode !== '0x'
  const contractAddress =
    transactionDetails?.recipient && isContract
      ? transactionDetails.recipient
      : undefined
  const originInfo = selectedPendingTransaction?.originInfo ?? activeOrigin

  // state
  const [isCriticalWarningPopupOpen, setIsCriticalWarningPopupOpen] =
    React.useState<boolean>(
      (txSimulation.action as BlowfishWarningActionKind) === 'BLOCK'
    )
  const [selectedTab, setSelectedTab] =
    React.useState<confirmPanelTabs>('transaction')
  const [isEditing, setIsEditing] = React.useState<boolean>(false)
  const [isEditingAllowance, setIsEditingAllowance] =
    React.useState<boolean>(false)
  const [showAdvancedTransactionSettings, setShowAdvancedTransactionSettings] =
    React.useState<boolean>(false)
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

  const onToggleEditGas = React.useCallback(
    () => setIsEditing((prev) => !prev),
    []
  )

  const onToggleEditAllowance = React.useCallback(
    () => setIsEditingAllowance((prev) => !prev),
    []
  )

  const onToggleAdvancedTransactionSettings = React.useCallback(() => {
    setShowAdvancedTransactionSettings((prev) => !prev)
  }, [])

  // render
  if (
    !txSimulation ||
    !transactionsNetwork ||
    !transactionDetails ||
    !selectedPendingTransaction
  ) {
    return <LoadingSimulation />
  }

  if (isEditing) {
    return <EditPendingTransactionGas onCancel={onToggleEditGas} />
  }

  if (isEditingAllowance) {
    return (
      <EditAllowance
        onCancel={onToggleEditAllowance}
        onSave={onEditAllowanceSave}
        proposedAllowance={transactionDetails.valueExact}
        symbol={transactionDetails.symbol}
        approvalTarget={transactionDetails.approvalTargetLabel || ''}
        isApprovalUnlimited={transactionDetails.isApprovalUnlimited || false}
      />
    )
  }

  if (showAdvancedTransactionSettings) {
    return (
      <AdvancedTransactionSettings
        onCancel={onToggleAdvancedTransactionSettings}
        nonce={transactionDetails.nonce}
        chainId={selectedPendingTransaction.chainId}
        txMetaId={selectedPendingTransaction.id}
        updateUnapprovedTransactionNonce={updateUnapprovedTransactionNonce}
      />
    )
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

            {/* TODO: locale, style */}
            <Text isBold textSize='14px' style={{ lineHeight: '24px' }}>
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
            <Button kind='filled' onClick={onReject}>
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
      <Column
        gap={'8px'}
        alignItems='center'
        justifyContent='flex-start'
        fullWidth
      >
        <Row
          width='100%'
          padding={'8px 12px'}
          alignItems='center'
          justifyContent={
            transactionsQueueLength > 1 ? 'space-between' : 'flex-start'
          }
        >
          <Column alignItems='flex-start' gap={'4px'}>
            <NetworkNameText>
              {transactionsNetwork?.chainName ?? ''}
            </NetworkNameText>
            <AccountNameAndAddress>
              <CopyTooltip
                isAddress
                text={fromAccount?.accountId.address}
                tooltipText={fromAccount?.accountId.address}
              >
                {fromAccount?.name ?? ''}{' '}
                {reduceAddress(fromAccount?.accountId.address) ?? ''}
              </CopyTooltip>
            </AccountNameAndAddress>
          </Column>
          <TransactionQueueSteps
            queueNextTransaction={queueNextTransaction}
            transactionQueueNumber={transactionQueueNumber}
            transactionsQueueLength={transactionsQueueLength}
          />
        </Row>

        <OriginRow>
          <TransactionOrigin
            originInfo={originInfo}
            contractAddress={contractAddress}
            onClickContractAddress={onClickViewOnBlockExplorer(
              'contract',
              contractAddress
            )}
            isFlagged={txSimulation.warnings.some((w) => isUrlWarning(w.kind))}
          />
        </OriginRow>

        <TabsAndContent>
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
            {!isSolanaTransaction && (
              <AdvancedTransactionSettingsButton
                onSubmit={onToggleAdvancedTransactionSettings}
              />
            )}
          </TabRow>

          <SimulationInfoColumn>
            {isWarningCollapsed && (
              <>
                {selectedTab === 'transaction' ? (
                  simulationResultsErrorText ? (
                    <MessageBox isDetails={true} isApprove={false}>
                      <ErrorText>{simulationResultsErrorText}</ErrorText>
                    </MessageBox>
                  ) : txSimulation && transactionsNetwork ? (
                    simulationType === 'EVM' ? (
                      <TransactionSimulationInfo
                        key={'EVMSimulationInfo'}
                        simulation={txSimulation}
                        simulationType={simulationType}
                        network={transactionsNetwork}
                      />
                    ) : (
                      <TransactionSimulationInfo
                        key={'SolanaSimulationInfo'}
                        simulation={txSimulation}
                        simulationType={simulationType}
                        network={transactionsNetwork}
                      />
                    )
                  ) : null
                ) : (
                  <MessageBox
                    isDetails={selectedTab === 'details'}
                    isApprove={isERC20Approve}
                  >
                    <TransactionDetailBox
                      transactionInfo={selectedPendingTransaction}
                    />
                  </MessageBox>
                )}
                <NetworkFeeRow>
                  <PendingTransactionNetworkFeeAndSettings
                    onToggleEditGas={onToggleEditGas}
                    feeDisplayMode='fiat'
                  />
                </NetworkFeeRow>
              </>
            )}
          </SimulationInfoColumn>
        </TabsAndContent>
      </Column>

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
                type={hasCriticalWarnings ? 'error' : 'warning'}
              >
                {txSimulation.warnings[0].message}
              </Alert>
            </>
          )}
        </FullWidth>
      ) : null}

      <Footer showGasErrors />
    </StyledWrapper>
  )
}

export default ConfirmSimulatedTransactionPanel
