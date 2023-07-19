/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/browser_element_identifiers.h"
#include "brave/grit/brave_generated_resources.h"
#include "components/user_education/common/tutorial_description.h"
#include "components/user_education/common/tutorial_registry.h"

void MaybeRegisterBraveTutorials(user_education::TutorialRegistry& registry) {
  using user_education::HelpBubbleArrow;
  using user_education::TutorialDescription;
  using BubbleStep = user_education::TutorialDescription::BubbleStep;

  if (registry.IsTutorialRegistered("Brave VPN Tutorial")) {
    return;
  }

  {  // VPN Tutorial.
    TutorialDescription description;
    description.steps = {
        BubbleStep(kBraveVPNButtonElementId)
            .SetBubbleBodyText(IDS_TUTORIAL_BRAVE_VPN_OPEN_PANEL)
            .SetBubbleArrow(HelpBubbleArrow::kBottomRight)
            .InAnyContext()};
    registry.AddTutorial("Brave VPN Tutorial", std::move(description));
  }
}
