// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

/* eslint-disable @typescript-eslint/key-spacing */

import * as React from 'react'
import { color } from '@brave/leo/tokens/css'

// magics
import {
  BLOWFISH_UNLIMITED_VALUE,
  NATIVE_ASSET_CONTRACT_ADDRESS_0X
} from '../../../../common/constants/magics'

// types
import { BraveWallet } from '../../../../constants/types'
import {
  ChainInfo,
  InlineViewOnBlockExplorerIconButton
} from './view_on_explorer_button'

// utils
import Amount from '../../../../utils/amount'
// import { getLocale } from '../../../../../common/locale'
import { reduceAddress } from '../../../../utils/reduce-address'
import { IconAsset } from '../../../shared/create-placeholder-icon'

// components
import { CopyTooltip } from '../../../shared/copy-tooltip/copy-tooltip'
import {
  AssetIconWithPlaceholder,
  NFT_ICON_STYLE,
  NftAssetIconWithPlaceholder
} from './state_change_asset_icons'

// style
import {
  ArrowRightIcon,
  StateChangeText,
  UnverifiedTokenIndicator
} from '../transaction_simulation_info.style'
import {
  Column,
  IconsWrapper,
  NetworkIconWrapper,
  Row,
  Text
} from '../../../shared/style'

type EVMApprovalData =
  | BraveWallet.BlowfishERC20ApprovalData
  | BraveWallet.BlowfishERC721ApprovalData
  | BraveWallet.BlowfishERC721ApprovalForAllData
  | BraveWallet.BlowfishERC1155ApprovalForAllData

export const EvmNativeAssetOrErc20TokenTransfer = ({
  network,
  transfer
}: {
  transfer:
    | BraveWallet.BlowfishERC20TransferData
    | BraveWallet.BlowfishNativeAssetTransferData
  network: ChainInfo
}): JSX.Element => {
  // memos
  const asset: IconAsset = React.useMemo(() => {
    return {
      contractAddress: transfer.asset.address,
      isErc721: false,
      isNft: false,
      chainId: network.chainId,
      logo: transfer.asset.imageUrl || '',
      name: transfer.asset.name,
      symbol: transfer.asset.symbol,
    }
  }, [transfer.asset, network.chainId])

  // computed
  const normalizedAmount = new Amount(transfer.amount.after)
    .minus(transfer.amount.before)
    .divideByDecimals(transfer.asset.decimals)
  const isReceive = normalizedAmount.isPositive()
  const isNativeAsset =
    transfer.asset.address === NATIVE_ASSET_CONTRACT_ADDRESS_0X ||
    transfer.asset.address === ''

  // render
  return (
    <Column alignItems='flex-start' padding={0} margin={'0px 0px 8px 0px'}>
      <Text textSize='12px' color={color.text.secondary}>
        {
          isReceive ? 'Receive' : 'Send' // TODO: locale
        }
      </Text>
      <Row
        margin={'4px 0px 0px 0px'}
        alignItems='center'
        justifyContent='flex-start'
      >
        <IconsWrapper
          marginRight='0px'
          title={
            // TODO: locale
            transfer.asset.verified && transfer.asset.lists.length > 0
              ? `This token is verified on ${transfer.asset.lists.length} lists`
              : transfer.asset.verified
              ? 'This token is verified'
              : 'This token is unverified'
          }
        >
          <AssetIconWithPlaceholder asset={asset} network={network} />
          {!transfer.asset.verified && (
            <NetworkIconWrapper>
              <UnverifiedTokenIndicator />
            </NetworkIconWrapper>
          )}
        </IconsWrapper>

        <Row alignItems='center' gap={'4px'} justifyContent='flex-start'>
          <StateChangeText
            color={isReceive ? color.systemfeedback.successIcon : undefined}
          >
            <strong>
              {isReceive ? ' + ' : ' - '}
              {normalizedAmount
                .toAbsoluteValue()
                .formatAsAsset(6, transfer.asset.symbol)}
            </strong>
          </StateChangeText>
          {!isNativeAsset && (
            <InlineViewOnBlockExplorerIconButton
              address={asset.contractAddress}
              network={network}
              urlType='token'
            />
          )}
        </Row>
      </Row>
    </Column>
  )
}

/**
 * For ERC721 & ERC1155 Transfers
 */
export const NonFungibleErcTokenTransfer = ({
  network,
  transfer
}: {
  network: ChainInfo
  transfer: Pick<
    BraveWallet.BlowfishERC721TransferData |
    BraveWallet.BlowfishERC1155TransferData,
    'amount' | 'contract' | 'metadata' | 'name' | 'tokenId'
  >
}): JSX.Element => {
  // memos
  const asset: IconAsset = React.useMemo(() => {
    return {
      chainId: network.chainId,
      contractAddress: transfer.contract.address,
      isErc721: !!transfer.tokenId,
      isNft: !!transfer.tokenId,
      logo: transfer.metadata.rawImageUrl || '',
      name: transfer.name,
      symbol: transfer.name,
      tokenId: transfer.tokenId || ''
    }
  }, [transfer, network.chainId])

  // computed
  const isReceive = new Amount(transfer.amount.after) //
    .gt(transfer.amount.before)

  const tokenIdNumber = transfer.tokenId
    ? new Amount(transfer.tokenId).toNumber()
    : undefined

  // render
  return (
    <Column alignItems='flex-start' padding={0} margin={'0px 0px 8px 0px'}>
      <Text textSize='12px' color={color.text.secondary}>
        {
          isReceive ? 'Receive' : 'Send' // TODO: locale
        }
      </Text>
      <Row
        margin={'4px 0px 0px 0px'}
        alignItems='center'
        justifyContent='flex-start'
      >
        <IconsWrapper marginRight='0px'>
          {asset.isNft ? (
            <NftAssetIconWithPlaceholder
              asset={asset}
              network={network}
              iconStyles={NFT_ICON_STYLE}
            />
          ) : (
            <AssetIconWithPlaceholder asset={asset} network={network} />
          )}
        </IconsWrapper>

        <Row alignItems='center' gap={'4px'} justifyContent='flex-start'>
          <StateChangeText
            color={isReceive ? color.systemfeedback.successIcon : undefined}
          >
            <strong>
              {isReceive ? ' + ' : ' - '}

              {asset.isNft &&
                `${asset.name}${
                  // show token id if not included in asset name
                  tokenIdNumber !== undefined &&
                  !asset.name.includes(tokenIdNumber.toString())
                    ? ` #${tokenIdNumber}`
                    : ''
                }`}

              {!asset.isNft &&
                new Amount(transfer.amount.after)
                  .minus(transfer.amount.before)
                  .toAbsoluteValue()
                  .formatAsAsset(6, asset.name || asset.symbol || '???')}
            </strong>
          </StateChangeText>

          <InlineViewOnBlockExplorerIconButton
            address={asset.contractAddress}
            id={transfer.tokenId}
            network={network}
            urlType={asset.isNft ? 'nft' : 'token'}
          />
        </Row>
      </Row>
    </Column>
  )
}

/**
 * Works for ERC20, ERC721, ERC1155
 */
export const ErcTokenApproval = ({
  approval,
  isERC20,
  network,
  isApprovalForAll
}: {
  network: ChainInfo
} & (
  | {
      isERC20?: undefined | false
      isApprovalForAll?: undefined | boolean
      approval: Pick<
        EVMApprovalData,
        'amount' | 'contract' | 'spender'
      >
    }
  | {
      isERC20: true
      approval: BraveWallet.BlowfishERC20ApprovalData
      isApprovalForAll?: undefined | false
    }
)): JSX.Element => {
  // memos
  /**
   * Not available for `BraveWallet.BlowfishERC1155ApprovalForAllData`
   */
  const assetSymbol = React.useMemo(() => {
    if (isERC20) {
      return approval?.asset?.symbol || undefined
    }

    return (
      (
        approval as
          | BraveWallet.BlowfishERC721ApprovalForAllData
          | BraveWallet.BlowfishERC721ApprovalData
      )?.symbol ?? undefined
    )
  }, [approval, isERC20])

  const beforeAmount = React.useMemo(() => {
    const before = new Amount(approval.amount.before)

    // TODO: fix UNLIMITED display
    if (
      before.gte(BLOWFISH_UNLIMITED_VALUE) ||
      (before.gt(0) && isApprovalForAll)
    ) {
      return `Unlimited ${assetSymbol}` // TODO: locale
    }

    if (isERC20) {
      return before
        .divideByDecimals(approval.asset.decimals)
        .formatAsAsset(6, assetSymbol)
    }
    return before.formatAsAsset(6, assetSymbol)
  }, [approval, isERC20])

  const afterAmount = React.useMemo(() => {
    const after = new Amount(approval.amount.after)

    if (
      after.gte(BLOWFISH_UNLIMITED_VALUE) ||
      (after.gt(0) && isApprovalForAll)
    ) {
      return `Unlimited ${assetSymbol}` // TODO: locale
    }

    if (isERC20) {
      return after
        .divideByDecimals(approval.asset.decimals)
        .formatAsAsset(6, assetSymbol)
    }
    return after.formatAsAsset(6, assetSymbol)
  }, [approval, isERC20, assetSymbol, isApprovalForAll])

  return (
    // TODO: Approval styles / component
    <Column
      style={{ color: 'white' }}
      margin={'0px 0px 6px 0px'}
      alignItems='flex-start'
      justifyContent='center'
    >
      <Row gap={'4px'} alignItems='center' justifyContent='flex-start'>
        <StateChangeText>
          <span>
            {/* TODO: locale */}
            {'From'}
          </span>
          <strong>{beforeAmount}</strong>

          <ArrowRightIcon />

          <span>
            {/* TODO: locale */}
            {'To'}
          </span>
          <strong>{afterAmount}</strong>
        </StateChangeText>
      </Row>
      <Row alignItems='center' justifyContent='flex-start'>
        <CopyTooltip
          isAddress
          text={approval.spender.address}
          tooltipText={approval.spender.address}
          position='left'
          verticalPosition='below'
        >
          <Text textSize='11px'>
            {/* TODO */}
            Spender: {reduceAddress(approval.spender.address)}{' '}
          </Text>
        </CopyTooltip>

        <InlineViewOnBlockExplorerIconButton
          address={approval.spender.address}
          network={network}
          urlType={'address'}
        />
      </Row>
    </Column>
  )
}
