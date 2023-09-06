// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'

// types
import {
  BlockExplorerUrlTypes, //
  BraveWallet
} from '../../../../constants/types'

// hooks
import { useExplorer } from '../../../../common/hooks/explorer'

// styles
import { LaunchIcon } from '../confirm_simulated_tx_panel.styles'
import { InlineAddressButton } from '../style'

export type ChainInfo = Pick<
  BraveWallet.NetworkInfo,
  'symbol' | 'chainId' | 'iconUrls' | 'chainName' | 'blockExplorerUrls' | 'coin'
>

export function InlineViewOnBlockExplorerIconButton({
  address,
  id,
  network,
  urlType
}: {
  address: string
  id?: string | undefined
  network: ChainInfo
  urlType: BlockExplorerUrlTypes
}) {
  // custom hooks
  const onClickViewOnBlockExplorer = useExplorer(network)

  return (
    <InlineAddressButton
      style={{ marginLeft: '4px' }}
      title={
        'view on block explorer' // TODO: locale
      }
      onClick={onClickViewOnBlockExplorer(urlType, address, id)}
    >
      <LaunchIcon />
    </InlineAddressButton>
  )
}
