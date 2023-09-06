// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'

// types
import {
  BraveWallet,
  MetaplexTokenStandard,
  SafeBlowfishEvmResponse,
  SafeBlowfishSolanaResponse
} from '../../../constants/types'

// utils
import {
  deserializeTransaction //
} from '../../../utils/model-serialization-utils'
import { findAccountByAccountId } from '../../../utils/account-utils'
import {
  accountInfoEntityAdaptor //
} from '../../../common/slices/entities/account-info.entity'

// components
import {
  WalletPanelStory //
} from '../../../stories/wrappers/wallet-panel-story-wrapper'
import { ConfirmSimulatedTransactionPanel } from './confirm_simulated_tx_panel'

// mocks
import {
  mockBlowfishAssetPrice,
  mockERC721ApproveForAllSim,
  mockEvmSimulatedERC20Approval,
  mockReceiveSolSimulation,
  mockSimulatedBuyERC1155Token,
  mockSimulatedBuyNFTWithETH,
  mockSimulatedERC721Approve,
  mockSimulatedSwapETHForDAI,
  mockSolStakingChangeSimulation,
  mockSolanaAccount,
  mockSplNft
} from '../../../common/constants/mocks'
import {
  mockSolanaTransactionInfo,
  mockTransactionInfo //
} from '../../../stories/mock-data/mock-transaction-info'
import {
  mockErc20TokensList //
} from '../../../stories/mock-data/mock-asset-options'

const _mockEvmAccountInfos: BraveWallet.AccountInfo[] = [
  {
    accountId: mockTransactionInfo.fromAccountId,
    address: mockTransactionInfo.fromAccountId.address,
    hardware: undefined,
    name: 'EVM Account 1'
  }
]

const mockEvmTxInfos: BraveWallet.TransactionInfo[] = [
  deserializeTransaction({
    ...mockTransactionInfo,
    fromAddress: mockTransactionInfo.fromAccountId.address,
    fromAccountId: mockTransactionInfo.fromAccountId,
    txStatus: BraveWallet.TransactionStatus.Unapproved
  }),
  deserializeTransaction({
    ...mockTransactionInfo,
    fromAddress: mockTransactionInfo.fromAccountId.address,
    fromAccountId: mockTransactionInfo.fromAccountId,
    txStatus: BraveWallet.TransactionStatus.Unapproved
  })
]

const evmSimulationResponse: SafeBlowfishEvmResponse = {
  action: 'BLOCK',
  warnings: [
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'Unsafe to sign with high risk of losing funds.'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message:
        'Gives permission for someone else to transfer' +
        ' many tokens on your behalf.'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'YOUR ACCOUNT WILL BE DRAINED!'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'A HORRIBLE EVENT WILL TAKE PLACE IF YOU SIGN THIS'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'ANOTHER HORRIBLE EVENT WILL TAKE PLACE IF YOU SIGN THIS'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'YET ANOTHER HORRIBLE EVENT WILL TAKE PLACE IF YOU SIGN THIS'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'VERY DANGEROUS'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'VERY DANGEROUS!!!'
    },
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'VERY DANGEROUS!!!!!!!!'
    }
  ],
  simulationResults: {
    error: mockSimulatedSwapETHForDAI.simulationResults.error,
    expectedStateChanges: [
      ...mockSimulatedSwapETHForDAI.simulationResults.expectedStateChanges,
      ...mockSimulatedBuyERC1155Token.simulationResults.expectedStateChanges,
      ...mockSimulatedBuyNFTWithETH.simulationResults.expectedStateChanges,
      ...mockEvmSimulatedERC20Approval.simulationResults.expectedStateChanges,
      ...mockSimulatedERC721Approve.simulationResults.expectedStateChanges,
      ...mockERC721ApproveForAllSim.simulationResults.expectedStateChanges,
      ...mockERC721ApproveForAllSim.simulationResults.expectedStateChanges
    ]
  }
}

const _mockSvmAccountInfos: BraveWallet.AccountInfo[] = [
  {
    ...mockSolanaAccount,
    address: mockSolanaTransactionInfo.fromAddress || '',
    accountId: mockSolanaTransactionInfo.fromAccountId
  }
]

const mockAccountsRegistry = accountInfoEntityAdaptor.addMany(
  accountInfoEntityAdaptor.getInitialState(),
  _mockEvmAccountInfos.concat(_mockSvmAccountInfos)
)

const mockSvmTxInfos: BraveWallet.TransactionInfo[] = [
  deserializeTransaction({
    ...mockSolanaTransactionInfo,
    fromAddress: _mockSvmAccountInfos[0].address,
    txStatus: BraveWallet.TransactionStatus.Unapproved,
    txType: BraveWallet.TransactionType.SolanaSystemTransfer
  }),
  deserializeTransaction({
    ...mockSolanaTransactionInfo,
    fromAddress: _mockSvmAccountInfos[0].address,
    txStatus: BraveWallet.TransactionStatus.Unapproved,
    txType: BraveWallet.TransactionType.SolanaSPLTokenTransfer
  })
]

const svmSimulationResponse: SafeBlowfishSolanaResponse = {
  ...mockReceiveSolSimulation,
  action: 'BLOCK',
  warnings: [
    {
      severity: 'CRITICAL',
      kind: 'KNOWN_MALICIOUS',
      message: 'Unsafe to sign with high risk of losing funds.'
    }
  ],
  simulationResults: {
    error: mockReceiveSolSimulation.simulationResults.error,
    expectedStateChanges:
      mockReceiveSolSimulation.simulationResults.expectedStateChanges
        .concat({
          humanReadableDiff: 'Send Brave NFT',
          suggestedColor: 'DEBIT',
          rawInfo: {
            kind: 'SPL_TRANSFER',
            data: {
              splTransferData: {
                assetPrice: mockBlowfishAssetPrice,
                decimals: mockSplNft.decimals,
                diff: {
                  digits: BigInt(1),
                  sign: 'MINUS' // todo: type safety
                },
                metaplexTokenStandard: 'non_fungible' as MetaplexTokenStandard,
                mint: mockSplNft.tokenId,
                name: mockSplNft.name,
                supply: BigInt(1),
                symbol: mockSplNft.symbol
              }
            }
          }
        })
        .concat(
          mockSolStakingChangeSimulation.simulationResults
            .expectedStateChanges[0]
        ),
    isRecentBlockhashExpired: false
  }
}
export const _ConfirmSimulatedEvmTransactionPanel = () => {
  return (
    <WalletPanelStory
      walletStateOverride={{
        hasInitialized: true,
        isWalletCreated: true,
        accounts: _mockEvmAccountInfos,
        fullTokenList: mockErc20TokensList
      }}
      panelStateOverride={{
        hasInitialized: true
      }}
      uiStateOverride={{
        selectedPendingTransactionId: mockEvmTxInfos[0].id
      }}
      walletApiDataOverrides={{
        accountInfos: _mockEvmAccountInfos,
        evmSimulationResponse: evmSimulationResponse,
        selectedAccountId: findAccountByAccountId(
          mockEvmTxInfos[0].fromAccountId,
          mockAccountsRegistry,
        )?.accountId,
        transactionInfos: mockEvmTxInfos
      }}
    >
      <ConfirmSimulatedTransactionPanel
        simulationType='EVM'
        txSimulation={evmSimulationResponse}
      />
    </WalletPanelStory>
  )
}

_ConfirmSimulatedEvmTransactionPanel.story = {
  name: 'Confirm Simulated EVM Transaction Panel'
}

export const _ConfirmSimulatedSvmTransactionPanel = () => {
  return (
    <WalletPanelStory
      walletStateOverride={{
        hasInitialized: true,
        isWalletCreated: true,
        accounts: _mockSvmAccountInfos,
        fullTokenList: mockErc20TokensList // make SOL list
      }}
      panelStateOverride={{
        hasInitialized: true,
      }}
      uiStateOverride={{
        selectedPendingTransactionId: mockSvmTxInfos[0].id
      }}
      walletApiDataOverrides={{
        accountInfos: _mockSvmAccountInfos,
        svmSimulationResponse: svmSimulationResponse,
        selectedAccountId: findAccountByAccountId(
          mockSvmTxInfos[0].fromAccountId,
          mockAccountsRegistry,
        )?.accountId,
        transactionInfos: mockSvmTxInfos,
      }}
    >
      <ConfirmSimulatedTransactionPanel
        simulationType='SVM'
        txSimulation={svmSimulationResponse}
      />
    </WalletPanelStory>
  )
}

_ConfirmSimulatedSvmTransactionPanel.story = {
  name: 'Confirm Simulated SVM Transaction Panel'
}

export default _ConfirmSimulatedEvmTransactionPanel
