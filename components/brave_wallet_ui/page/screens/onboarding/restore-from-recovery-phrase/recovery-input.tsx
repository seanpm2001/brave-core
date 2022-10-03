// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import * as React from 'react'

// utils
import { getLocale } from '../../../../../common/locale'
import { clearClipboard } from '../../../../utils/copy-to-clipboard'

// style
import { RecoveryTextArea, RecoveryTextInput } from './restore-from-recovery-phrase.style'
import { PhraseCardBody, PhraseCardBottomRow, PhraseCardTopRow } from '../onboarding.style'
import { ToggleVisibilityButton, WalletLink } from '../../../../components/shared/style'

interface Props {
  onChange: (results: { value: string, isValid: boolean, phraseLength: number }) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
  onToggleShowPhrase: (isShown: boolean) => void
}

interface State {
  value: string
  isPhraseShown: boolean
}

// Forked from: https://github.com/lovasoa/react-contenteditable
// Using a class component due to this issue: https://github.com/lovasoa/react-contenteditable/issues/161
export class RecoveryInput extends React.Component<Props, State> {
  state: State = {
    isPhraseShown: false,
    value: ''
  }

  handleChange = (event: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement
  >) => {
    const inputValue = event.target?.value
    const divValue = event.target.innerText

    const value = inputValue || divValue

    // This prevents there from being a space at the begining of the phrase.
    const removedBeginingWhiteSpace = value.trimStart()

    // This Prevents there from being more than one space between words.
    const removedDoubleSpaces = removedBeginingWhiteSpace.replace(/ +(?= )/g, '')

    // Although the above removes double spaces, it is initialy recognized as a
    // a double-space before it is removed and macOS automatically replaces double-spaces with a period.
    const removePeriod = removedDoubleSpaces.replace(/['/.']/g, '')

    // max length
    const maxLength = 24

    // This prevents an extra space at the end of a 24 word phrase.
    const needsCleaning = removedDoubleSpaces.split(' ').length === maxLength

    const cleanedInput = needsCleaning
      ? removePeriod.trimEnd()
      : removePeriod

    const wordsInPhraseValue = cleanedInput.trim().split(/\s+/g).length

    // valid lengths: 12, 15, 18, 21, or 24
    const isInvalid =
      wordsInPhraseValue < 12 ||
      wordsInPhraseValue > 12 && wordsInPhraseValue < 15 ||
      wordsInPhraseValue > 15 && wordsInPhraseValue < 18 ||
      wordsInPhraseValue > 18 && wordsInPhraseValue < 21 ||
      wordsInPhraseValue > 21 && wordsInPhraseValue < 24

    // update parent
    this.props.onChange({
      value: cleanedInput,
      isValid: !isInvalid,
      phraseLength: wordsInPhraseValue
    })

    // update local state
    this.setState({ value: cleanedInput })
  }

  toggleShowPhrase = () => {
    this.setState(prev => {
      this.props.onToggleShowPhrase(!prev.isPhraseShown)
      return {
        ...prev,
        isPhraseShown: !prev.isPhraseShown
      }
    })
  }

  onClickPasteFromClipboard = async () => {
    const phraseFromClipboard = await navigator.clipboard.readText()
    clearClipboard()
    this.handleChange({
      target: { value: phraseFromClipboard }
    } as React.ChangeEvent<HTMLInputElement>)
  }

  render = () => {
    const {
      isPhraseShown,
      value
    } = this.state
    const { onKeyDown } = this.props

    return <>
      <PhraseCardTopRow>
        <ToggleVisibilityButton
          isVisible={isPhraseShown}
          onClick={this.toggleShowPhrase}
        />
      </PhraseCardTopRow>

      <PhraseCardBody>
        {isPhraseShown
          ? <RecoveryTextArea
              onChange={this.handleChange}
              onPaste={clearClipboard}
              onKeyDown={onKeyDown}
              value={value}
              autoComplete='off'
            />
          : <RecoveryTextInput
              type='password'
              value={value}
              onChange={this.handleChange}
              onPaste={clearClipboard}
              onKeyDown={onKeyDown}
              autoComplete='off'
            />
        }
      </PhraseCardBody>

      <PhraseCardBottomRow centered>
        <WalletLink
          as='button'
          onClick={this.onClickPasteFromClipboard}
        >
          {getLocale('braveWalletPasteFromClipboard')}
        </WalletLink>
      </PhraseCardBottomRow>
    </>
  }
}
