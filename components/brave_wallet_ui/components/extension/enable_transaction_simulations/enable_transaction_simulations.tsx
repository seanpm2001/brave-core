// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'
import Icon from '@brave/leo/react/icon'

// utils
import { getLocale, getLocaleWithTag } from '../../../../common/locale'

// hooks
import {
  useSetIsTxSimulationOptInStatusMutation
} from '../../../common/slices/api.slice'

// components
import { NavButton } from '../buttons/nav-button/index'

// styles
import {
  Column,
  Row,
  VerticalDivider,
  VerticalSpacer
} from '../../shared/style'
import {
  Backdrop,
  Background,
  BulletPoints,
  CardContent,
  DashedHorizontalLine,
  FloatingCard,
  Header,
  HeadingText,
  IconContainer,
  LearnMoreLink,
  OptionsRow,
  TermsText,
  errorIconColor
} from './enable_transaction_simulations.styles'
import {
  LoadingIconWrapper,
  LoadingIconFG,
  LoadingIconBG
} from '../confirm-transaction-panel/confirm_simulated_tx_panel.styles'


const CHANGE_IN_SETTINGS_TEXT = getLocaleWithTag(
  'braveWalletChangeAnytimeInSettings'
)

const TX_SIMULATION_FEATURE_BULLETS = [
  'braveWalletTransactionSimulationSeeEstimates',
  'braveWalletTransactionSimulationDetectMalicious',
  'braveWalletTransactionSimulationDetectPhishing'
].map((key) => <li key={key}>{getLocale(key)}</li>)

export const EnableTransactionSimulations: React.FC = () => {
  // mutations
  const [optInOrOut] = useSetIsTxSimulationOptInStatusMutation()

  return (
    <Background>
      <Backdrop>
        <FloatingCard>
          <Header>
            <Row
              width='100%'
              alignItems='center'
              justifyContent='center'
              gap={'4px'}
            >
              <IconContainer>
                <Icon name={'product-brave-wallet'} />
              </IconContainer>
              <DashedHorizontalLine />
              <IconContainer iconColor={errorIconColor}>
                <Icon name={'warning-triangle-outline'} />
              </IconContainer>
            </Row>
          </Header>

          <CardContent>
            <HeadingText>
              {getLocale('braveWalletEnableEnhancedTransactionDetailsTitle')}
            </HeadingText>

            <BulletPoints>{TX_SIMULATION_FEATURE_BULLETS}</BulletPoints>

            <VerticalSpacer space={4} />
            <VerticalDivider />
            <VerticalSpacer space={8} />

            <TermsText>
              {getLocale('braveWalletTransactionSimulationTerms')}{' '}
              <LearnMoreLink
                href='https://blowfish.xyz' // TODO: link?
                rel='noopener noreferrer'
              >
                {getLocale('braveWalletLearnMore')}
              </LearnMoreLink>
            </TermsText>

            <TermsText>
              {CHANGE_IN_SETTINGS_TEXT.beforeTag}
              <strong>{CHANGE_IN_SETTINGS_TEXT.duringTag}</strong>
              {CHANGE_IN_SETTINGS_TEXT.afterTag}
            </TermsText>

            <OptionsRow>
              <NavButton
                buttonType='cancel'
                text={getLocale('braveWalletButtonNoThanks')}
                onSubmit={() => {
                  return optInOrOut('denied')
                }}
              />
              <NavButton
                buttonType='primary'
                text={getLocale('braveWalletButtonEnable')}
                onSubmit={() => {
                  return optInOrOut('allowed')
                }}
              />
            </OptionsRow>
          </CardContent>
        </FloatingCard>
      </Backdrop>
    </Background>
  )
}

export const LoadingSimulation: React.FC = () => {
  return (
    <Background>
      <Backdrop>
        <FloatingCard>
          <Column
            alignItems='center'
            justifyContent='center'
            gap={24}
            fullWidth
            fullHeight
          >
            <LoadingIconWrapper>
              <LoadingIconFG />
              <LoadingIconBG />
            </LoadingIconWrapper>
            {/* TODO: Locale */}
            {'Scanning Transaction'}
          </Column>
        </FloatingCard>
      </Backdrop>
    </Background>
  )
}

export default EnableTransactionSimulations
