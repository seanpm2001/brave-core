// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'

import WalletPageStory from '../../../stories/wrappers/wallet-page-story-wrapper'
import { SignPanel } from './index'

import {
  BraveWallet
} from '../../../constants/types'
import { mockOriginInfo } from '../../../stories/mock-data/mock-origin-info'
import { mockAccount } from '../../../common/constants/mocks'

const signMessageData: BraveWallet.SignMessageRequest = {
  id: 0,
  accountId: {
    ...mockAccount.accountId,
    address: '0x3f29A1da97149722eB09c526E4eAd698895b426',
  },
  originInfo: mockOriginInfo,
  coin: BraveWallet.CoinType.ETH,
  chainId: BraveWallet.MAINNET_CHAIN_ID,
  signData: {
    ethSignTypedData: undefined,
    solanaSignData: undefined,
    ethSiweData: {
      address: '0x3f29A1da97149722eB09c526E4eAd698895b426',
      expirationTime: '02/16/2024',
      issuedAt: '02/01/2024',
      nonce: '5f654',
      notBefore: '',
      requestId: '22',
      resources: undefined,
      statement: 'This is a test statement',
      uri: {
        url: mockOriginInfo.originSpec
      },
      version: 1,
      chainId: BigInt(123),
      origin: {
        host: '',
        nonceIfOpaque: undefined,
        port: 0,
        scheme: ''
      }
    },
    ethStandardSignData: undefined
  }
}

const evilUnicodeMessage = 'Sign into \u202E EVIL'

const evilUnicodeSignMessageData = {
  ...signMessageData,
  message: evilUnicodeMessage
}

export const _SignPanel = () => {
  return <WalletPageStory>
    <SignPanel
      onCancel={() => alert('')}
      showWarning={true}
      signMessageData={[evilUnicodeSignMessageData, signMessageData]}
    />
  </WalletPageStory>
}

_SignPanel.story = {
  name: 'Sign Panel'
}

export default _SignPanel
