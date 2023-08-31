/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_VIEWS_TABS_BRAVE_TAB_GROUP_STYLE_H_
#define BRAVE_BROWSER_UI_VIEWS_TABS_BRAVE_TAB_GROUP_STYLE_H_

#include "chrome/browser/ui/views/tabs/tab_group_style.h"

class BraveTabGroupStyle : public TabGroupStyle {
 public:
  using TabGroupStyle::TabGroupStyle;

  gfx::Insets GetInsetsForHeaderChip() const override;
};

#endif  // BRAVE_BROWSER_UI_VIEWS_TABS_BRAVE_TAB_GROUP_STYLE_H_
