// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import {
  BLOWFISH_URL_WARNING_KINDS,
  BlowfishURLWarningKind
} from '../common/constants/blowfish'
import {
  BlowfishSimulationResponse,
  SafeBlowfishWarning,
  BlowfishWarningActionKind,
  BraveWallet,
  SafeSolanaSimulationResults,
  SafeEVMSimulationResults,
  SafeSolanaStateChange,
  SafeEvmApprovalEvent,
  SafeEvmTransferEvent,
  SafeERC20ApprovalEvent,
  SafeERC721ApprovalEvent,
  SafeERC721ApprovalForAllEvent,
  SafeERC1155ApprovalForAllEvent,
  SafeERC20TransferEvent,
  SafeERC721TransferEvent,
  SafeERC1155TransferEvent,
  SafeNativeTransferEvent,
  SafeSolTransferEvent,
  SafeSolanaStakeChangeEvent,
  SafeSplApprovalEvent,
  SafeSplTransferEvent,
  SafeBlowfishSimulationResponse,
  SafeEVMStateChange,
  SafeEvmEvent,
  // SafeSolanaAccountOwnerChangeEvent,
} from '../constants/types'

interface GroupedEVMStateChanges {
  evmApprovals: SafeEvmApprovalEvent[]
  evmTransfers: SafeEvmTransferEvent[]
}

interface GroupedSVMStateChanges {
  svmStakeAuthorityChanges: SafeSolanaStakeChangeEvent[]
  splApprovals: SafeSplApprovalEvent[]
  svmTransfers: Array<
    | SafeSolTransferEvent
    | SafeSplTransferEvent
  >
}

export const decodeSimulatedTxResponseActionsAndWarnings = <
  T extends BlowfishSimulationResponse | SafeBlowfishSimulationResponse
>(
  response: T
) => {
  return {
    action: response.action as BlowfishWarningActionKind,
    warnings: response.warnings as SafeBlowfishWarning[],
    simulationResults:
      response.simulationResults as T extends BraveWallet.EVMSimulationResponse
        ? SafeEVMSimulationResults
        : SafeSolanaSimulationResults
  } as const
}

export const groupSimulatedEVMStateChanges = (
  evmStateChanges:
    | BraveWallet.BlowfishEVMStateChange[]
    | SafeEVMStateChange[]
    | SafeEvmEvent[]
): GroupedEVMStateChanges => {
  const changes: GroupedEVMStateChanges = {
    evmApprovals: [],
    evmTransfers: []
  }

  for (const stateChange of evmStateChanges as SafeEVMStateChange[]) {
    const { data } = stateChange.rawInfo

    // approvals
    if (data.erc20ApprovalData) {
      changes.evmApprovals.push(stateChange as SafeERC20ApprovalEvent)
    }

    if (data.erc721ApprovalData) {
      changes.evmApprovals.push(stateChange as SafeERC721ApprovalEvent)
    }

    // approvals for all
    if (data.erc721ApprovalForAllData) {
      changes.evmApprovals.push(stateChange as SafeERC721ApprovalForAllEvent)
    }

    if (data.erc1155ApprovalForAllData) {
      changes.evmApprovals.push(stateChange as SafeERC1155ApprovalForAllEvent)
    }

    // transfers
    if (data.erc20TransferData) {
      changes.evmTransfers.push(stateChange as SafeERC20TransferEvent)
    }

    if (data.erc721TransferData) {
      changes.evmTransfers.push(stateChange as SafeERC721TransferEvent)
    }

    if (data.erc1155TransferData) {
      changes.evmTransfers.push(stateChange as SafeERC1155TransferEvent)
    }

    if (data.nativeAssetTransferData) {
      changes.evmTransfers.push(stateChange as SafeNativeTransferEvent)
    }
  }

  return changes
}

export const decodeSimulatedSVMStateChanges = (
  stateChanges:
    | BraveWallet.BlowfishSolanaStateChange[]
    | SafeSolanaStateChange[]
): GroupedSVMStateChanges => {
  const changes: GroupedSVMStateChanges = {
    svmStakeAuthorityChanges: [],
    splApprovals: [],
    svmTransfers: []
  }

  for (const stateChange of stateChanges as SafeSolanaStateChange[]) {
    const { data } = stateChange.rawInfo

    // TODO: account owner changes
    // if (data) {
    //   changes.svmStakeAuthorityChanges.push(
    //     stateChange as SafeSolanaAccountOwnerChangeEvent
    //   )
    // }

    // staking auth changes
    if (data.solStakeAuthorityChangeData) {
      changes.svmStakeAuthorityChanges.push(
        stateChange as SafeSolanaStakeChangeEvent
      )
    }

    // approvals
    if (data.splApprovalData) {
      changes.splApprovals.push(stateChange as SafeSplApprovalEvent)
    }

    // transfers
    if (data.solTransferData) {
      changes.svmTransfers.push(stateChange as SafeSolTransferEvent)
    }

    if (data.splTransferData) {
      changes.svmTransfers.push(stateChange as SafeSplTransferEvent)
    }
  }

  return changes
}

export const translateEvmSimulationResultError = (
  error:
    | BraveWallet.BlowfishEVMError
    | BraveWallet.BlowfishSolanaError
    | undefined
) => {
  if (!error) {
    return ''
  }

  // TODO: getLocale('')
  switch (error?.kind) {
    case 'TRANSACTION_REVERTED':
      return 'TRANSACTION_REVERTED'
    default:
      return error.humanReadableError || 'UNKNOWN ERROR'
  }
}

export const isUrlWarning = (
  warningKind: string
): warningKind is BlowfishURLWarningKind => {
  return BLOWFISH_URL_WARNING_KINDS.includes(
    warningKind as BlowfishURLWarningKind
  )
}
