/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_ADS_CORE_PUBLIC_COMMON_SUBDIVISION_SUBDIVISION_UTIL_H_
#define BRAVE_COMPONENTS_BRAVE_ADS_CORE_PUBLIC_COMMON_SUBDIVISION_SUBDIVISION_UTIL_H_

#include <string>

#include "third_party/abseil-cpp/absl/types/optional.h"

namespace brave_ads {

absl::optional<std::string> GetSubdivisionCountryCode(
    const std::string& subdivision);
absl::optional<std::string> GetSubdivisionCode(const std::string& subdivision);

}  // namespace brave_ads

#endif  // BRAVE_COMPONENTS_BRAVE_ADS_CORE_PUBLIC_COMMON_SUBDIVISION_SUBDIVISION_UTIL_H_
