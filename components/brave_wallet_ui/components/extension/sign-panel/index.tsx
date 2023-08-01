// Copyright (c) 2021 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at https://mozilla.org/MPL/2.0/.
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { skipToken } from '@reduxjs/toolkit/query/react'

// Hooks
import { useAccountOrb } from '../../../common/hooks/use-orb'

// Queries
import { useAccountQuery } from '../../../common/slices/api.slice.extra'

// Types
import { BraveWallet, SignDataSteps } from '../../../constants/types'

// Utils
import { getLocale } from '../../../../common/locale'
import { unicodeEscape, hasUnicode } from '../../../utils/string-utils'
import { useGetNetworkQuery } from '../../../common/slices/api.slice'
import { PanelActions } from '../../../panel/actions'
import { isHardwareAccount } from '../../../utils/account-utils'

// Components
import { NavButton } from '../buttons/nav-button/index'
import { PanelTab } from '../panel-tab/index'
import { CreateSiteOrigin } from '../../shared/create-site-origin/index'

// Styled Components
import {
  StyledWrapper,
  AccountCircle,
  AccountNameText,
  TopRow,
  NetworkText,
  PanelTitle,
  MessageBox,
  MessageHeader,
  MessageText,
  ButtonRow,
  WarningTitleRow
} from './style'

import {
  QueueStepRow,
  QueueStepButton,
  QueueStepText
} from '../confirm-transaction-panel/common/style'

import {
  TabRow,
  WarningBox,
  WarningTitle,
  WarningText,
  LearnMoreButton,
  URLText,
  WarningIcon
} from '../shared-panel-styles'

interface Props {
  signMessageData: BraveWallet.SignMessageRequest[]
  onCancel: () => void
  showWarning: boolean
}

const onClickLearnMore = () => {
  chrome.tabs.create({
    url: 'https://support.brave.com/hc/en-us/articles/4409513799693'
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('tabs.create failed: ' + chrome.runtime.lastError.message)
    }
  })
}

export const SignPanel = (props: Props) => {
  const {
    signMessageData,
    onCancel,
    showWarning
  } = props

  // redux
  const dispatch = useDispatch()

  // queries
  const { data: network } = useGetNetworkQuery(
    signMessageData[0]
      ? {
          chainId: signMessageData[0].chainId,
          coin: signMessageData[0].coin
        }
      : skipToken
  )

  // state
  const [signStep, setSignStep] = React.useState<SignDataSteps>(SignDataSteps.SignData)
  const [selectedQueueData, setSelectedQueueData] = React.useState<BraveWallet.SignMessageRequest>(signMessageData[0])
  const [renderUnicode, setRenderUnicode] = React.useState<boolean>(true)

  const { account } = useAccountQuery(selectedQueueData?.accountId)
  const ethStandardSignData = selectedQueueData.signData.ethStandardSignData
  const ethSignTypedData = selectedQueueData.signData.ethSignTypedData

  // memos
  const orb = useAccountOrb(account)

  const signMessageQueueInfo = React.useMemo(() => {
    return {
      queueLength: signMessageData.length,
      queueNumber: signMessageData.findIndex((data) => data.id === selectedQueueData.id) + 1
    }
  }, [signMessageData, selectedQueueData])

  const isDisabled = React.useMemo((): boolean => signMessageData.findIndex(
    (data) =>
      data.id === selectedQueueData.id) !== 0
    , [signMessageData, selectedQueueData]
  )

  // methods
  const onContinueSigning = () => {
    setSignStep(SignDataSteps.SignData)
  }

  const onQueueNextSignMessage = () => {
    if (signMessageQueueInfo.queueNumber === signMessageQueueInfo.queueLength) {
      setSelectedQueueData(signMessageData[0])
      return
    }
    setSelectedQueueData(signMessageData[signMessageQueueInfo.queueNumber])
  }

  const onSign = () => {
    if (!account) {
      return
    }

    if (isHardwareAccount(account.accountId)) {
      dispatch(
        PanelActions.signMessageHardware({
          account,
          request: signMessageData[0]
        })
      )
    } else {
      dispatch(
        PanelActions.signMessageProcessed({
          approved: true,
          id: signMessageData[0].id
        })
      )
    }
  }

  // effects
  React.useEffect(() => {
    setSelectedQueueData(signMessageData[0])
  }, [signMessageData])

  React.useEffect(() => {
    if (showWarning) {
      setSignStep(SignDataSteps.SignRisk)
    }
  }, [showWarning])

  // render
  return (
    <StyledWrapper>
      <TopRow>
        <NetworkText>{network?.chainName ?? ''}</NetworkText>
        {signMessageQueueInfo.queueLength > 1 &&
          <QueueStepRow>
            <QueueStepText>{signMessageQueueInfo.queueNumber} {getLocale('braveWalletQueueOf')} {signMessageQueueInfo.queueLength}</QueueStepText>
            <QueueStepButton
              onClick={onQueueNextSignMessage}
            >
              {signMessageQueueInfo.queueNumber === signMessageQueueInfo.queueLength
                ? getLocale('braveWalletQueueFirst')
                : getLocale('braveWalletQueueNext')
              }
            </QueueStepButton>
          </QueueStepRow>
        }
      </TopRow>
      <AccountCircle orb={orb} />
      <URLText>
        <CreateSiteOrigin
          originSpec={selectedQueueData.originInfo.originSpec}
          eTldPlusOne={selectedQueueData.originInfo.eTldPlusOne}
        />
      </URLText>
      <AccountNameText>{account?.name ?? ''}</AccountNameText>
      <PanelTitle>{getLocale('braveWalletSignTransactionTitle')}</PanelTitle>
      {signStep === SignDataSteps.SignRisk &&
        <WarningBox warningType='danger'>
          <WarningTitleRow>
            <WarningIcon />
            <WarningTitle warningType='danger'>{getLocale('braveWalletSignWarningTitle')}</WarningTitle>
          </WarningTitleRow>
          <WarningText>{getLocale('braveWalletSignWarning')}</WarningText>
          <LearnMoreButton onClick={onClickLearnMore}>{getLocale('braveWalletAllowAddNetworkLearnMoreButton')}</LearnMoreButton>
        </WarningBox>
      }
      {signStep === SignDataSteps.SignData &&
        <>
          <TabRow>
            <PanelTab
              isSelected={true}
              text={
                ethSignTypedData
                  ? getLocale('braveWalletSignTransactionEIP712MessageTitle')
                  : getLocale('braveWalletSignTransactionMessageTitle')
              }
            />
          </TabRow>

          {(hasUnicode(selectedQueueData.signData.ethStandardSignData?.message ?? '') ||
            hasUnicode(ethSignTypedData?.message ?? '') ||
            hasUnicode(ethSignTypedData?.domain ?? '')) &&
            <WarningBox warningType='warning'>
              <WarningTitleRow>
                <WarningIcon color={'warningIcon'} />
                <WarningTitle warningType='warning'>
                  {
                    getLocale('braveWalletNonAsciiCharactersInMessageWarning')
                  }
                </WarningTitle>
              </WarningTitleRow>
              <LearnMoreButton
                onClick={() => setRenderUnicode(prev => !prev)}
              >
                {
                 renderUnicode
                  ? getLocale('braveWalletViewDecodedMessage')
                  : getLocale('braveWalletViewEncodedMessage')
                }
              </LearnMoreButton>
            </WarningBox>
          }

          {ethSignTypedData && (
            <MessageBox height='180px'>
              <MessageHeader>
                {getLocale('braveWalletSignTransactionEIP712MessageDomain')}:
              </MessageHeader>
              <MessageText>
                {!renderUnicode && hasUnicode(ethSignTypedData.domain)
                  ? unicodeEscape(ethSignTypedData.domain)
                  : ethSignTypedData.domain
                }
              </MessageText>

              <MessageHeader>
                {getLocale('braveWalletSignTransactionMessageTitle')}:
              </MessageHeader>
              <MessageText>
                {!renderUnicode && hasUnicode(ethSignTypedData.message)
                  ? unicodeEscape(ethSignTypedData.message)
                  : ethSignTypedData.message
                }
              </MessageText>
            </MessageBox>
          )}

          {ethStandardSignData && (
            <MessageBox>
              <MessageText>
                {!renderUnicode && hasUnicode(ethStandardSignData.message)
                  ? unicodeEscape(ethStandardSignData.message)
                  : ethStandardSignData.message
                }
              </MessageText>
            </MessageBox>
          )}
        </>
      }
      <ButtonRow>
        <NavButton
          buttonType='secondary'
          text={getLocale('braveWalletButtonCancel')}
          onSubmit={onCancel}
          disabled={isDisabled}
        />
        <NavButton
          buttonType={signStep === SignDataSteps.SignData ? 'sign' : 'danger'}
          text={signStep === SignDataSteps.SignData ? getLocale('braveWalletSignTransactionButton') : getLocale('braveWalletButtonContinue')}
          onSubmit={signStep === SignDataSteps.SignRisk ? onContinueSigning : onSign}
          disabled={isDisabled}
        />
      </ButtonRow>
    </StyledWrapper>
  )
}

export default SignPanel
