// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import * as React from 'react'

import Alert from '@brave/leo/react/alert'
import Button from '@brave/leo/react/button'

// style
import { FullWidth, Text } from '../../../shared/style'

type Props = {
  retrySimulation?: (() => void) | (() => Promise<void>)
}

export function TxSimulationFailedWarning({
  retrySimulation
}: Props) {
  // render
  return (
    <FullWidth>
      <Alert type='warning' mode='simple'>
        <Text textSize='12px'>
          {/* TODO: locale with tag */}
          Transaction preview failed.{' '}
        </Text>
        {retrySimulation ? (
          <Button kind='plain' onClick={retrySimulation}>
            {/* TODO: locale */}
            Retry
          </Button>
        ) : null}
      </Alert>
    </FullWidth>
  )
}