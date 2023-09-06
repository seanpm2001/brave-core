// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.
/* eslint-disable @typescript-eslint/key-spacing */

import * as React from 'react'

// types & magics
import {
  BraveWallet,
  SafeBlowfishEvmResponse,
  SafeBlowfishSolanaResponse,
  SafeEVMStateChange,
  SafeEvmApprovalEvent,
  SafeEvmTransferEvent,
  SafeSolTransferEvent,
  SafeSolanaStateChange,
  SafeSplTransferEvent
} from '../../../constants/types'

// utils
import { getLocale } from '../../../../common/locale'

// hooks
import {
  useSelectedPendingTransaction //
} from '../../../common/hooks/use-pending-transaction'

// components
import {
  ErcTokenApproval,
  EvmNativeAssetOrErc20TokenTransfer,
  NonFungibleErcTokenTransfer
} from './common/evm_state_changes'
import {
  SolStakingAuthChange,
  SOLTransfer,
  SPLTokenTransfer
} from './common/svm_state_changes'

// style
import { TransactionTitle, TransactionTypeText } from './style'
import {
  groupSimulatedEVMStateChanges,
  decodeSimulatedSVMStateChanges,
  decodeSimulatedTxResponseActionsAndWarnings
} from '../../../utils/tx-simulation-utils'
import { Column, Row } from '../../shared/style'
import {
  CollapseHeaderDivider,
  Divider,
  TransactionChangeCollapse,
  TransactionChangeCollapseContainer,
  TransactionChangeCollapseContent,
  TransactionChangeCollapseTitle
} from './confirm_simulated_tx_panel.styles'
import { ChainInfo } from './common/view_on_explorer_button'

type TransactionInfoProps = (
  | {
      simulationType: 'EVM'
      simulation: BraveWallet.EVMSimulationResponse | SafeBlowfishEvmResponse
    }
  | {
      simulationType: 'SVM'
      simulation:
        | BraveWallet.SolanaSimulationResponse
        | SafeBlowfishSolanaResponse
    }
) & {
  network: ChainInfo
}

export const TransactionSimulationInfo = ({
  simulation,
  simulationType,
  network
}: TransactionInfoProps) => {
  // custom hooks
  const tx = useSelectedPendingTransaction()

  // computed
  const { simulationResults } =
    decodeSimulatedTxResponseActionsAndWarnings(simulation)
  const { expectedStateChanges } = simulationResults
  const sendOptions = tx?.txDataUnion.solanaTxData?.sendOptions

  const { evmChanges, svmChanges } =
    simulationType === 'EVM'
      ? {
          evmChanges: groupSimulatedEVMStateChanges(
            expectedStateChanges as SafeEVMStateChange[]
          ),
          svmChanges: undefined
        }
      : {
          svmChanges: decodeSimulatedSVMStateChanges(
            expectedStateChanges as SafeSolanaStateChange[]
          ),
          evmChanges: undefined
        }

  const hasApprovals = Boolean(
    evmChanges?.evmApprovals.length || svmChanges?.splApprovals.length
  )

  const hasTransfers = Boolean(
    evmChanges?.evmTransfers.length || svmChanges?.svmTransfers.length
  )

  const hasSolStakingAuthChanges = Boolean(
    svmChanges?.svmStakeAuthorityChanges.length
  )

  const hasMultipleCategories =
    [hasApprovals, hasTransfers, hasSolStakingAuthChanges].filter(Boolean)
      .length > 1

  // state
  const [isTransfersSectionOpen, setTransfersSectionOpen] = React.useState(true)
  const [isApprovalsSectionOpen, setIsApprovalsSectionOpen] = React.useState(
    !hasMultipleCategories
  )
  const [isSolStakingAuthSectionOpen, setIsSolStakingAuthSectionOpen] =
    React.useState(!hasMultipleCategories)

  // methods
  const onToggleTransfersSection = () => {
    if (!hasMultipleCategories) {
      return
    }

    if (isTransfersSectionOpen) {
      setTransfersSectionOpen(false)
      return
    }

    setTransfersSectionOpen(true)
    setIsApprovalsSectionOpen(false)
    setIsSolStakingAuthSectionOpen(false)
  }

  const onToggleApprovalsSection = () => {
    if (!hasMultipleCategories) {
      return
    }

    if (isApprovalsSectionOpen) {
      setIsApprovalsSectionOpen(false)
      return
    }

    setIsApprovalsSectionOpen(true)

    setTransfersSectionOpen(false)
    setIsSolStakingAuthSectionOpen(false)
  }

  const onToggleSolStakingAuthSection = () => {
    if (!hasMultipleCategories) {
      return
    }

    if (isSolStakingAuthSectionOpen) {
      setIsSolStakingAuthSectionOpen(false)
      return
    }

    setIsSolStakingAuthSectionOpen(true)

    setTransfersSectionOpen(false)
    setIsApprovalsSectionOpen(false)
  }

  // render
  return (
    <TransactionChangeCollapseContainer
      hasMultipleCategories={hasMultipleCategories}
    >
      {/* Transferred Assets */}
      {hasTransfers ? (
        <TransactionChangeCollapse
          onToggle={onToggleTransfersSection}
          hasMultipleCategories={hasMultipleCategories}
          isOpen={isTransfersSectionOpen}
          key={'transfers'}
        >
          <TransactionChangeCollapseTitle slot='title'>
            {
              // TODO: locale
              'Balance Changes'
            }
          </TransactionChangeCollapseTitle>
          <TransactionChangeCollapseContent>
            <CollapseHeaderDivider key={'Transfers-Divider'} />

            {evmChanges?.evmTransfers.map((transfer, i, arr) => {
              return (
                <React.Fragment key={'EVM-Transfer-' + i}>
                  {getComponentForEvmTransfer(transfer, network)}
                  {i < arr.length - 1 ? <Divider /> : null}
                </React.Fragment>
              )
            })}

            {svmChanges?.svmTransfers.map((transfer, i, arr) => (
              <React.Fragment key={'SVM-Transfer' + i}>
                {getComponentForSvmTransfer(transfer, network)}
                {i < arr.length - 1 ? <Divider /> : null}
              </React.Fragment>
            ))}
          </TransactionChangeCollapseContent>
        </TransactionChangeCollapse>
      ) : null}

      {hasApprovals && (
        <TransactionChangeCollapse
          onToggle={onToggleApprovalsSection}
          hasMultipleCategories={hasMultipleCategories}
          isOpen={isApprovalsSectionOpen}
          key='approvals'
        >
          <TransactionChangeCollapseTitle slot='title'>
            {
              // TODO: locale
              'Approvals'
            }
          </TransactionChangeCollapseTitle>
          <TransactionChangeCollapseContent>
            <CollapseHeaderDivider key={'EVM-Approvals-Divider'} />

            {evmChanges?.evmApprovals.map((approval, i, arr) => (
              <React.Fragment key={'EVM-Token-Approval-' + i}>
                {getComponentForEvmApproval(approval, network)}
                {i < arr.length - 1 ? <Divider /> : null}
              </React.Fragment>
            ))}
          </TransactionChangeCollapseContent>
        </TransactionChangeCollapse>
      )}

      {hasSolStakingAuthChanges && (
        <TransactionChangeCollapse
          onToggle={onToggleSolStakingAuthSection}
          hasMultipleCategories={hasMultipleCategories}
          isOpen={isSolStakingAuthSectionOpen}
          key='SOL-staking-changes'
        >
          <TransactionChangeCollapseTitle slot='title'>
            {
              // TODO: locale
              'SOL Staking changes'
            }
          </TransactionChangeCollapseTitle>
          <TransactionChangeCollapseContent>
            <CollapseHeaderDivider key={'SolStakingAuthChanges-Divider'} />
            {svmChanges?.svmStakeAuthorityChanges.map((approval, i, arr) => (
              <React.Fragment key={'SolStakingAuthChanges-' + i}>
                <SolStakingAuthChange approval={approval} network={network} />
                {i < arr.length - 1 ? <Divider /> : null}
              </React.Fragment>
            ))}
          </TransactionChangeCollapseContent>
        </TransactionChangeCollapse>
      )}

      {/* SEND OPTIONS */}
      {sendOptions && (
        <Column margin={'16px 4px 0px 4px'}>
          {!!Number(sendOptions?.maxRetries?.maxRetries) && (
            <Row justifyContent='flex-start' gap={'4px'}>
              <TransactionTitle>
                {getLocale('braveWalletSolanaMaxRetries')}
              </TransactionTitle>
              <TransactionTypeText>
                {Number(sendOptions?.maxRetries?.maxRetries)}
              </TransactionTypeText>
            </Row>
          )}

          {sendOptions?.preflightCommitment && (
            <Row justifyContent='flex-start' gap={'4px'}>
              <TransactionTitle>
                {getLocale('braveWalletSolanaPreflightCommitment')}
              </TransactionTitle>
              <TransactionTypeText>
                {sendOptions.preflightCommitment}
              </TransactionTypeText>
            </Row>
          )}

          {sendOptions?.skipPreflight && (
            <Row justifyContent='flex-start' gap={'4px'}>
              <TransactionTitle>
                {getLocale('braveWalletSolanaSkipPreflight')}
              </TransactionTitle>
              <TransactionTypeText>
                {sendOptions.skipPreflight.skipPreflight.toString()}
              </TransactionTypeText>
            </Row>
          )}
        </Column>
      )}
    </TransactionChangeCollapseContainer>
  )
}

function getComponentForEvmApproval(
  approval: SafeEvmApprovalEvent,
  network: ChainInfo
) {
  switch (approval.rawInfo.kind) {
    case 'ERC20_APPROVAL': {
      return (
        <ErcTokenApproval
          key={approval.humanReadableDiff}
          approval={approval.rawInfo.data.erc20ApprovalData}
          network={network}
          isERC20={true}
        />
      )
    }
    case 'ERC1155_APPROVAL_FOR_ALL': {
      return (
        <ErcTokenApproval
          key={approval.humanReadableDiff}
          approval={approval.rawInfo.data.erc1155ApprovalForAllData}
          network={network}
          isApprovalForAll={true}
        />
      )
    }
    case 'ERC721_APPROVAL': {
      return (
        <ErcTokenApproval
          key={approval.humanReadableDiff}
          approval={approval.rawInfo.data.erc721ApprovalData}
          network={network}
        />
      )
    }
    case 'ERC721_APPROVAL_FOR_ALL': {
      return (
        <ErcTokenApproval
          key={approval.humanReadableDiff}
          approval={approval.rawInfo.data.erc721ApprovalForAllData}
          network={network}
          isApprovalForAll={true}
        />
      )
    }
  }
}

function getComponentForSvmTransfer(
  transfer: SafeSolTransferEvent | SafeSplTransferEvent,
  network: ChainInfo
) {
  return transfer.rawInfo.kind === 'SOL_TRANSFER' ? (
    <SOLTransfer
      key={transfer.humanReadableDiff}
      transfer={transfer.rawInfo.data.solTransferData}
      network={network}
    />
  ) : (
    <SPLTokenTransfer
      key={transfer.humanReadableDiff}
      transfer={transfer.rawInfo.data.splTransferData}
      network={network}
    />
  )
}

function getComponentForEvmTransfer(
  transfer: SafeEvmTransferEvent,
  network: ChainInfo
) {
  const { kind, data } = transfer.rawInfo

  switch (kind) {
    case 'ERC1155_TRANSFER':
      return (
        <NonFungibleErcTokenTransfer
          key={transfer.humanReadableDiff}
          transfer={data.erc1155TransferData}
          network={network}
        />
      )
    case 'ERC20_TRANSFER':
      return (
        <EvmNativeAssetOrErc20TokenTransfer
          key={transfer.humanReadableDiff}
          transfer={data.erc20TransferData}
          network={network}
        />
      )
    case 'NATIVE_ASSET_TRANSFER':
      return (
        <EvmNativeAssetOrErc20TokenTransfer
          key={transfer.humanReadableDiff}
          transfer={data.nativeAssetTransferData}
          network={network}
        />
      )
    case 'ERC721_TRANSFER':
      return (
        <NonFungibleErcTokenTransfer
          key={transfer.humanReadableDiff}
          transfer={data.erc721TransferData}
          network={network}
        />
      )
  }
}
