/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/overlay/brave_video_overlay_window_views.h"

#include "base/memory/ptr_util.h"
#include "chrome/browser/ui/browser.h"
#include "ui/compositor/compositor.h"

#define BRAVE_UPDATE_MAX_SIZE max_size_ = work_area.size();
#define WrapUnique WrapUnique(new BraveVideoOverlayWindowViews(controller)); if (0) std::unique_ptr<VideoOverlayWindowViews> dummy
#include "src/chrome/browser/ui/views/overlay/video_overlay_window_views.cc"
#undef WrapUnique
#undef BRAVE_UPDATE_MAX_SIZE
