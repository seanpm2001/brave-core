/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/extensions/api/brave_education_api.h"

#include "brave/browser/ui/browser_element_identifiers.h"
#include "brave/browser/ui/tabs/brave_tab_prefs.h"
#include "brave/common/extensions/api/brave_education.h"
#include "brave/grit/brave_generated_resources.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_finder.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/ui/chrome_pages.h"
#include "chrome/browser/ui/user_education/open_page_and_show_help_bubble.h"
#include "chrome/browser/ui/user_education/user_education_service.h"
#include "chrome/browser/ui/user_education/user_education_service_factory.h"
#include "chrome/common/webui_url_constants.h"
#include "ui/base/l10n/l10n_util.h"

namespace extensions::api {

ExtensionFunction::ResponseAction
BraveEducationOpenSettingsFunction::Run() {
  auto params = brave_education::OpenSettings::Params::Create(args());
  EXTENSION_FUNCTION_VALIDATE(params);
  return RespondNow([&] {
    if (ExtensionTabUtil::IsTabStripEditable()) {
      ExtensionTabUtil::OpenTabParams options;
      options.url = params->url;
      auto result = ExtensionTabUtil::OpenTab(this, options, user_gesture());
      if (!result.has_value()) {
        return Error(result.error());
      }
    }
    return NoArguments();
  }());
}

ExtensionFunction::ResponseAction
BraveEducationOpenVerticalTabsSettingsFunction::Run() {
  return RespondNow([&] {
    OpenPageAndShowHelpBubble::Params params;
    params.target_url = chrome::GetSettingsUrl(chrome::kAppearanceSubPage);
    params.bubble_anchor_id = kVerticalTabsSettingElementId;
    params.bubble_arrow = user_education::HelpBubbleArrow::kBottomLeft;
    params.bubble_text = l10n_util::GetStringUTF16(
        IDS_SETTINGS_VERTICAL_TABS_IPH_BUBBLE_TEXT);
    params.close_button_alt_text_id =
        IDS_SETTINGS_VERTICAL_TABS_IPH_BUBBLE_CLOSE_BUTTON_ARIA_LABEL_TEXT;

    if (auto* browser = chrome::FindLastActive()) {
      OpenPageAndShowHelpBubble::Start(browser, std::move(params));
    }

    return NoArguments();
  }());
}

ExtensionFunction::ResponseAction
BraveEducationEnableVerticalTabsFunction::Run() {
  return RespondNow([&] {
    auto* profile = Profile::FromBrowserContext(browser_context());
    profile->GetPrefs()->SetBoolean(brave_tabs::kVerticalTabsEnabled, true);
    return NoArguments();
  }());
}

ExtensionFunction::ResponseAction
BraveEducationStartVpnTutorialFunction::Run() {
  return RespondNow([&] {
    auto* profile = Profile::FromBrowserContext(browser_context());
    auto* service = UserEducationServiceFactory::GetForProfile(profile);
    if (!service) {
      return NoArguments();
    }

    const ui::ElementContext context = chrome::FindBrowserWithProfile(profile)
        ->window()
        ->GetElementContext();
    if (!context) {
      return NoArguments();
    }

    service->tutorial_service().StartTutorial("Brave VPN Tutorial", context);
    return NoArguments();
  }());
}

}  // namespace extensions::api
