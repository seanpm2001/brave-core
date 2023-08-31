/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/tabs/brave_tab_group_style.h"

#include "brave/browser/ui/tabs/brave_tab_layout_constants.h"

gfx::Insets BraveTabGroupStyle::GetInsetsForHeaderChip() const {
  auto insets = TabGroupStyle::GetInsetsForHeaderChip();
  insets += gfx::Insets::VH(0, brave_tabs::kHorizontalTabInset);
  return insets;
}
