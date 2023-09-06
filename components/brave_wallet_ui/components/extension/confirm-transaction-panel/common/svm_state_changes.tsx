// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'
import { color } from '@brave/leo/tokens/css'

// types & magics
import {
  BraveWallet,
  MetaplexTokenStandard,
  SafeSolanaStakeChangeEvent
} from '../../../../constants/types'

// utils
import Amount from '../../../../utils/amount'
// import { getLocale } from '../../../../../common/locale'
import { reduceAddress } from '../../../../utils/reduce-address'
import { IconAsset } from '../../../shared/create-placeholder-icon'

// hooks
import { useGetTokensRegistryQuery } from '../../../../common/slices/api.slice'

// components
// import { CopyTooltip } from '../../../shared/copy-tooltip/copy-tooltip'
import { InlineViewOnBlockExplorerIconButton } from './view_on_explorer_button'
import {
  AssetIconWithPlaceholder,
  NftAssetIconWithPlaceholder,
  NFT_ICON_STYLE
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

type BlockchainInfo = Pick<
  BraveWallet.NetworkInfo,
  'symbol' | 'chainId' | 'iconUrls' | 'chainName' | 'blockExplorerUrls' | 'coin'
>

export const SOLTransfer = ({
  network,
  transfer
}: {
  transfer: BraveWallet.BlowfishSOLTransferData
  network: Pick<
    BraveWallet.NetworkInfo,
    'chainId' | 'symbol' | 'iconUrls' | 'chainName' | 'blockExplorerUrls'
  >
}): JSX.Element => {
  // memos
  const asset = React.useMemo(() => {
    return {
      contractAddress: '',
      isErc721: false,
      isNft: false,
      logo: network.iconUrls[0],
      name: transfer.name,
      symbol: transfer.symbol,
      chainId: network.chainId
    }
  }, [transfer, network])

  const normalizedAmount = React.useMemo(() => {
    return new Amount(transfer.diff.digits.toString()).divideByDecimals(
      transfer.decimals
    )
  }, [transfer])

  // computed
  const isReceive = transfer.diff.sign.toLowerCase() !== 'minus'
  const isVerified = true // TODO: look at our tokens list

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
            isVerified ? 'This token is verified' : 'This token is unverified'
          }
        >
          <AssetIconWithPlaceholder asset={asset} network={network} />
          {!isVerified && (
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
                .formatAsAsset(6, transfer.symbol)}
            </strong>
          </StateChangeText>
        </Row>
      </Row>
    </Column>
  )
}

export const SPLTokenTransfer = ({
  network,
  transfer
}: {
  transfer: BraveWallet.BlowfishSPLTransferData
  network: BlockchainInfo
}): JSX.Element => {
  const { assetIsKnown, assetLogo = '' } = useGetTokensRegistryQuery(
    undefined,
    {
      selectFromResult: (res) => {
        const assetId = res.data?.idsByChainId[network.chainId].find((id) =>
          id.toString().includes(transfer.mint)
        )
        const asset = assetId ? res.data?.entities[assetId] : undefined
        return {
          isLoading: res.isLoading,
          assetIsKnown: Boolean(asset),
          assetLogo: asset?.logo
        }
      }
    }
  )

  const asset: IconAsset = {
    contractAddress: transfer.mint,
    isErc721: false,
    logo: assetLogo,
    name: transfer.name,
    symbol: transfer.symbol,
    chainId: network.chainId,
    isNft:
      (transfer.metaplexTokenStandard as MetaplexTokenStandard) ===
        'non_fungible' ||
      (transfer.metaplexTokenStandard as MetaplexTokenStandard) ===
        'non_fungible_edition'
  }

  // memos
  const normalizedAmount = React.useMemo(() => {
    return new Amount(transfer.diff.digits.toString()).divideByDecimals(
      transfer.decimals
    )
  }, [transfer])

  // computed
  const isReceive = transfer.diff.sign.toLowerCase() !== 'minus'
  const isVerified = assetIsKnown

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
            isVerified
              ? 'This token is verified is 1 list'
              : 'This token is unverified'
          }
        >
          {asset.isNft ? (
            <NftAssetIconWithPlaceholder
              asset={asset}
              network={network}
              iconStyles={NFT_ICON_STYLE}
            />
          ) : (
            <AssetIconWithPlaceholder asset={asset} network={network} />
          )}
          {!isVerified && (
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
              {asset.isNft
                ? asset.name
                : normalizedAmount
                    .toAbsoluteValue()
                    .formatAsAsset(6, asset.symbol)}
            </strong>
          </StateChangeText>

          <InlineViewOnBlockExplorerIconButton
            address={asset.contractAddress}
            network={network}
            urlType={'contract'}
          />
        </Row>
      </Row>
    </Column>
  )
}

export function SolStakingAuthChange({
  approval,
  network
}: {
  approval: SafeSolanaStakeChangeEvent
  network: BlockchainInfo
  // network: Pick<
  //   BraveWallet.NetworkInfo,
  //   'chainId' | 'symbol' | 'iconUrls' | 'chainName' | 'blockExplorerUrls'
  // >
}) {
  // computed from props
  const changedData = approval.rawInfo.data.solStakeAuthorityChangeData
  const hasStakerChange =
    changedData.currAuthorities.staker !== changedData.futureAuthorities.staker
  const hasWithdrawerChange =
    changedData.currAuthorities.withdrawer !==
    changedData.futureAuthorities.withdrawer

  const AddressChange = React.useCallback(
    ({
      fromAddress,
      toAddress
    }: {
      fromAddress: string
      toAddress: string
    }) => {
      return (
        <Row
          alignItems='center'
          justifyContent='flex-start'
          padding={'8px 0px'}
        >
          <StateChangeText>
            {/* TODO: locale */}
            <strong>
              {reduceAddress(fromAddress)}
              <InlineViewOnBlockExplorerIconButton
                address={fromAddress}
                network={network}
                urlType='address'
              />
            </strong>

            <ArrowRightIcon />

            <span>
              {/* TODO: locale */}
              {'To '}
              <strong>
                {reduceAddress(toAddress)}
                <InlineViewOnBlockExplorerIconButton
                  address={toAddress}
                  network={network}
                  urlType='address'
                />
              </strong>
            </span>
          </StateChangeText>
        </Row>
      )
    },
    [network]
  )

  // render
  return (
    // TODO: Approval styles / component
    <Column
      style={{ color: 'white' }}
      margin={'0px 0px 6px 0px'}
      alignItems='flex-start'
      justifyContent='center'
    >
      {hasStakerChange ? (
        <Column justifyContent='center' alignItems='flex-start'>
          <Row alignItems='center' justifyContent='flex-start'>
            <StateChangeText>
              {
                // TODO: locale
                'Staker'
              }
            </StateChangeText>
          </Row>
          <AddressChange
            fromAddress={changedData.currAuthorities.staker}
            toAddress={changedData.futureAuthorities.staker}
          />
        </Column>
      ) : null}

      {hasWithdrawerChange ? (
        <Column justifyContent='center' alignItems='flex-start'>
          <Row alignItems='center' justifyContent='flex-start'>
            <StateChangeText>
              {
                // TODO: locale
                'Withdrawer'
              }
            </StateChangeText>
          </Row>
          <AddressChange
            fromAddress={changedData.currAuthorities.withdrawer}
            toAddress={changedData.futureAuthorities.withdrawer}
          />
        </Column>
      ) : null}
    </Column>
  )
}
