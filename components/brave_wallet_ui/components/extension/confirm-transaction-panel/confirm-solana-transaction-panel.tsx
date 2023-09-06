// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'

// types
import { BraveWallet } from '../../../constants/types'

// Utils
import Amount from '../../../utils/amount'
import { getLocale } from '../../../../common/locale'
import { WalletSelectors } from '../../../common/selectors'
import { getTransactionStatusString } from '../../../utils/tx-utils'

// Hooks
import { usePendingTransactions } from '../../../common/hooks/use-pending-transaction'
import {
  useUnsafeWalletSelector //
} from '../../../common/hooks/use-safe-selector'

// Components
import Tooltip from '../../shared/tooltip/index'
import CreateSiteOrigin from '../../shared/create-site-origin/index'
import PanelTab from '../panel-tab'
import { TransactionInfo } from './transaction-info'
import { SolanaTransactionDetailBox } from '../transaction-box/solana-transaction-detail-box'
import { TransactionQueueSteps } from './common/queue'
import { Footer } from './common/footer'
import {
  TxSimulationFailedWarning //
} from './common/tx_simulation_failed_warning'

// Styles
import { Skeleton } from '../../shared/loading-skeleton/styles'
import {
  TabRow,
  URLText,
  LearnMoreButton,
} from '../shared-panel-styles'
import {
  StyledWrapper,
  FromCircle,
  ToCircle,
  AccountNameText,
  TopRow,
  NetworkText,
  TransactionAmountBig,
  TransactionFiatAmountBig,
  MessageBox,
  TransactionTypeText,
  AccountCircleWrapper,
  ArrowIcon,
  FromToRow,
  GroupBox,
  GroupBoxColumn,
  GroupBoxTitle,
  GroupBoxText,
  GroupEnumeration,
  SmallLoadIcon,
  WarningInfoCircleIcon
} from './style'
import { Row, StatusBubble } from '../../shared/style'

type confirmPanelTabs = 'transaction' | 'details'

const onClickLearnMore = () => {
  // TODO: link is broken
  chrome.tabs.create({ url: 'https://support.brave.com/hc/en-us/articles/5546517853325' }, () => {
    if (chrome.runtime.lastError) {
      console.error('tabs.create failed: ' + chrome.runtime.lastError.message)
    }
  })
}

export const ConfirmSolanaTransactionPanel = ({
  retrySimulation
}: {
  retrySimulation?: () => void
}) => {
  // redux
  const activeOrigin = useUnsafeWalletSelector(WalletSelectors.activeOrigin)
  const defaultCurrencies = useUnsafeWalletSelector(
    WalletSelectors.defaultCurrencies
  )

  // custom hooks
  const {
    fromAddress,
    fromOrb,
    isAssociatedTokenAccountCreation,
    toOrb,
    transactionDetails,
    transactionsNetwork,
    transactionTitle,
    isSolanaDappTransaction,
    fromAccountName,
    groupTransactions,
    selectedPendingTransactionGroupIndex,
    selectedPendingTransaction,
    queueNextTransaction,
    transactionQueueNumber,
    transactionsQueueLength
  } = usePendingTransactions()
  const originInfo = selectedPendingTransaction?.originInfo ?? activeOrigin

  // state
  const [selectedTab, setSelectedTab] = React.useState<confirmPanelTabs>('transaction')

  // methods
  const onSelectTab = React.useCallback(
    (tab: confirmPanelTabs) => () => setSelectedTab(tab),
  [])

  // render
  if (
    !transactionDetails ||
    !selectedPendingTransaction ||
    !transactionsNetwork
  ) {
    return (
      <StyledWrapper>
        <Skeleton width={'100%'} height={'100%'} enableAnimation />
      </StyledWrapper>
    )
  }

  return (
    <StyledWrapper>
      <TopRow>
        <NetworkText>{transactionsNetwork.chainName}</NetworkText>
        <TransactionQueueSteps
          queueNextTransaction={queueNextTransaction}
          transactionQueueNumber={transactionQueueNumber}
          transactionsQueueLength={transactionsQueueLength}
        />
      </TopRow>

      <AccountCircleWrapper>
        <FromCircle orb={fromOrb} />
        <ToCircle orb={toOrb} />
      </AccountCircleWrapper>
      <URLText>
        <CreateSiteOrigin
          originSpec={originInfo.originSpec}
          eTldPlusOne={originInfo.eTldPlusOne}
        />
      </URLText>
      <FromToRow>
        <Tooltip text={fromAddress} isAddress={true} position='left'>
          <AccountNameText>{fromAccountName}</AccountNameText>
        </Tooltip>

        {transactionDetails.recipient &&
          transactionDetails.recipient !== fromAddress && (
            <>
              <ArrowIcon />
              <Tooltip
                text={transactionDetails.recipient}
                isAddress={true}
                position='right'
              >
                <AccountNameText>
                  {transactionDetails.recipientLabel}
                </AccountNameText>
              </Tooltip>
            </>
          )}
      </FromToRow>

      <TransactionTypeText>{transactionTitle}</TransactionTypeText>

      {!isSolanaDappTransaction && (
        <>
          <Row
            margin={
              isAssociatedTokenAccountCreation ? '0px 0px 0px 16px' : undefined
            }
            alignItems='center'
            justifyContent='center'
            gap={'4px'}
          >
            <TransactionAmountBig>
              {new Amount(transactionDetails.valueExact).formatAsAsset(
                undefined,
                transactionDetails.symbol
              )}
            </TransactionAmountBig>
            {isAssociatedTokenAccountCreation && (
              <Tooltip
                maxWidth={'200px'}
                minWidth={'180px'}
                text={
                  <>
                    {getLocale(
                      'braveWalletConfirmTransactionAccountCreationFee'
                    )}
                    {/* TODO: combine string with learn more link */}{' '}
                    <LearnMoreButton onClick={onClickLearnMore}>
                      {getLocale('braveWalletAllowAddNetworkLearnMoreButton')}
                    </LearnMoreButton>
                  </>
                }
              >
                <WarningInfoCircleIcon />
              </Tooltip>
            )}
          </Row>

          <TransactionFiatAmountBig>
            {new Amount(transactionDetails.fiatValue).formatAsFiat(
              defaultCurrencies.fiat
            )}
          </TransactionFiatAmountBig>
        </>
      )}

      {groupTransactions.length > 0 &&
        selectedPendingTransactionGroupIndex >= 0 &&
        selectedPendingTransaction && (
          <GroupBox>
            <GroupBoxColumn>
              <GroupBoxTitle>
                {/* TODO: locale */}
                Transaction group
              </GroupBoxTitle>
              {groupTransactions.map((txn, idx) => (
                <GroupBoxText
                  dark={selectedPendingTransactionGroupIndex === idx}
                  key={idx}
                >
                  <GroupEnumeration>
                    [{idx + 1}/{groupTransactions.length}]
                  </GroupEnumeration>

                  <StatusBubble status={txn.txStatus} />

                  {getTransactionStatusString(txn.txStatus)}

                  {[
                    BraveWallet.TransactionStatus.Approved,
                    BraveWallet.TransactionStatus.Submitted
                  ].includes(txn.txStatus) && <SmallLoadIcon />}
                </GroupBoxText>
              ))}
            </GroupBoxColumn>
          </GroupBox>
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

      <MessageBox isDetails={selectedTab === 'details'} isApprove={false}>
        {selectedTab === 'transaction' ? (
          <TransactionInfo />
        ) : (
          <SolanaTransactionDetailBox
            data={selectedPendingTransaction?.txDataUnion?.solanaTxData}
            instructions={transactionDetails.instructions}
            txType={selectedPendingTransaction.txType}
          />
        )}
      </MessageBox>

      {retrySimulation && (
        <TxSimulationFailedWarning retrySimulation={retrySimulation} />
      )}

      <Footer />
    </StyledWrapper>
  )
}

export default ConfirmSolanaTransactionPanel
