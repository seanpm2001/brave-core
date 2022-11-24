// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'
import { useHistory } from 'react-router'
import { WalletRoutes } from '../../../constants/types'

interface Props {
  onDismiss: () => void
}

// components
import {
  StyledWrapper,
  Ipfs,
  Text,
  LearnMore,
  CloseButton
} from './nft-ipfs-banner.styles'

export const NftIpfsBanner = ({ onDismiss }: Props) => {
  const history = useHistory()

  const onLearnMore = React.useCallback(() => {
    history.push(WalletRoutes.LocalIpfsNode)
  }, [])

  return (
    <StyledWrapper>
      <Ipfs />
      <Text>Now you can run your IPFS and be part of web 3. Your NFT data will stay online forever and cannot be tampered with.&nbsp;
        <LearnMore onClick={onLearnMore}>Learn more</LearnMore>
      </Text>
      <CloseButton onClick={onDismiss}/>
    </StyledWrapper>
  )
}
