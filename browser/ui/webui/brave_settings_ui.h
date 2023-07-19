/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_SETTINGS_UI_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_SETTINGS_UI_H_

#include <memory>
#include <string>

#include "brave/components/commands/common/commands.mojom.h"
#include "chrome/browser/ui/webui/settings/settings_ui.h"

namespace content {
class WebUIDataSource;
}

class Profile;

class BraveSettingsUI : public settings::SettingsUI {
 public:
  BraveSettingsUI(content::WebUI* web_ui, const std::string& host);
  BraveSettingsUI(const BraveSettingsUI&) = delete;
  BraveSettingsUI& operator=(const BraveSettingsUI&) = delete;
  ~BraveSettingsUI() override;

  static void AddResources(content::WebUIDataSource* html_source,
                           Profile* profile);
  // Allows disabling CSP on settings page so EvalJS could be run in main world.
  static bool& ShouldDisableCSPForTesting();

  static bool& ShouldExposeElementsForTesting();

  void BindInterface(
      mojo::PendingReceiver<commands::mojom::CommandsService> pending_receiver);

 private:
  void CreateHelpBubbleHandler(
      mojo::PendingRemote<help_bubble::mojom::HelpBubbleClient> client,
      mojo::PendingReceiver<help_bubble::mojom::HelpBubbleHandler> handler)
      override;

  std::unique_ptr<user_education::HelpBubbleHandler> help_bubble_handler_;
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_SETTINGS_UI_H_
