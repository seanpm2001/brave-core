// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'

// Types
import {
  BraveWallet,
  CoinTypes,
  SerializableTransactionInfo
} from '../../../constants/types'

// Utils
import { getCoinFromTxDataUnion } from '../../../utils/network-utils'
import { isSolanaTransaction } from '../../../utils/tx-utils'

import {
  useGetEVMTransactionSimulationQuery,
  useGetIsTxSimulationOptInStatusQuery,
  useGetSolanaTransactionSimulationQuery
} from '../../../common/slices/api.slice'

// Components
import { ConfirmSwapTransaction } from '../confirm-transaction-panel/swap'
import {
  ConfirmSimulatedTransactionPanel //
} from '../confirm-transaction-panel/confirm_simulated_tx_panel'
import {
  ConfirmSolanaTransactionPanel //
} from '../confirm-transaction-panel/confirm-solana-transaction-panel'
import {
  ConfirmTransactionPanel //
} from '../confirm-transaction-panel/confirm-transaction-panel'
import {
  EnableTransactionSimulations, //
  LoadingSimulation
} from '../enable_transaction_simulations/enable_transaction_simulations'

interface Props {
  selectedPendingTransaction: SerializableTransactionInfo
}

export const PendingTransactionPanel: React.FC<Props> = ({
  selectedPendingTransaction
}) => {
  // queries & query args
  const selectedPendingTxCoinType = getCoinFromTxDataUnion(
    selectedPendingTransaction.txDataUnion
  )

  const { data: txSimulationOptIn } = useGetIsTxSimulationOptInStatusQuery()
  const {
    data: evmTxSimulation,
    isLoading: isLoadingEvmTxSimulation,
    isFetching: isFetchingEvmTxSimulation,
    isError: hasEvmSimulationError,
    refetch: retryEvmSimulation
  } = useGetEVMTransactionSimulationQuery(
    txSimulationOptIn === 'allowed' &&
      selectedPendingTxCoinType === CoinTypes.ETH
      ? {
          chainId: selectedPendingTransaction.chainId,
          coinType: selectedPendingTxCoinType,
          id: selectedPendingTransaction.id
        }
      : skipToken
  )
  const {
    data: solanaTxSimulation,
    isLoading: isLoadingSolanaTxSimulation,
    isFetching: isFetchingSolanaTxSimulation,
    isError: hasSolanaSimulationError,
    refetch: retrySolanaSimulation
  } = useGetSolanaTransactionSimulationQuery(
    txSimulationOptIn === 'allowed' &&
      selectedPendingTxCoinType === CoinTypes.SOL
      ? {
          chainId: selectedPendingTransaction.chainId,
          id: selectedPendingTransaction.id,
          mode: 'transactionInfo'
        }
      : skipToken
  )

  // render

  // Simulations Opt-in screen
  if (txSimulationOptIn === 'unset') {
    return <EnableTransactionSimulations />
  }

  // Simulated EVM Transaction
  if (
    txSimulationOptIn === 'allowed' &&
    // has valid EVM pending transaction simulation
    selectedPendingTxCoinType === CoinTypes.ETH &&
    !hasEvmSimulationError &&
    !isLoadingEvmTxSimulation &&
    !isFetchingEvmTxSimulation &&
    evmTxSimulation
  ) {
    return (
      <ConfirmSimulatedTransactionPanel
        key={'EVM'}
        simulationType={'EVM'}
        txSimulation={evmTxSimulation}
      />
    )
  }

  // Simulated Solana Transaction
  if (
    txSimulationOptIn === 'allowed' &&
    selectedPendingTxCoinType === CoinTypes.SOL &&
    !hasSolanaSimulationError &&
    !isLoadingSolanaTxSimulation &&
    !isFetchingSolanaTxSimulation &&
    solanaTxSimulation
  ) {
    return (
      <ConfirmSimulatedTransactionPanel
        key={'SVM'}
        simulationType={'SVM'}
        txSimulation={solanaTxSimulation}
      />
    )
  }

  // Loading/Fetching Simulation
  if (
    txSimulationOptIn === 'allowed' &&
    (isLoadingEvmTxSimulation ||
      isFetchingEvmTxSimulation ||
      isFetchingSolanaTxSimulation ||
      isLoadingSolanaTxSimulation)
  ) {
    return <LoadingSimulation />
  }

  // Safer-Sign (Brave Swap)
  if (
    selectedPendingTransaction.txType === BraveWallet.TransactionType.ETHSwap
  ) {
    return (
      <ConfirmSwapTransaction
        retrySimulation={
          txSimulationOptIn === 'allowed' && hasEvmSimulationError
            ? retryEvmSimulation
            : undefined
        }
      />
    )
  }

  // Default
  return isSolanaTransaction(selectedPendingTransaction) ? (
    <ConfirmSolanaTransactionPanel
      retrySimulation={
        txSimulationOptIn === 'allowed' && hasSolanaSimulationError
          ? retrySolanaSimulation
          : undefined
      }
    />
  ) : (
    <ConfirmTransactionPanel
      retrySimulation={
        txSimulationOptIn === 'allowed' && hasEvmSimulationError
          ? retryEvmSimulation
          : undefined
      }
    />
  )
}

export default PendingTransactionPanel
