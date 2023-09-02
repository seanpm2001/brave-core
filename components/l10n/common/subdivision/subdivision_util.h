/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_L10N_COMMON_SUBDIVISION_SUBDIVISION_UTIL_H_
#define BRAVE_COMPONENTS_L10N_COMMON_SUBDIVISION_SUBDIVISION_UTIL_H_

#include <string>

#include "third_party/abseil-cpp/absl/types/optional.h"

class PrefService;

namespace brave_l10n {
absl::optional<std::string> GetSubdivisionCountryCode(
    const std::string& subdivision);
absl::optional<std::string> GetSubdivisionCode(const std::string& subdivision);
std::string GetCurrentSubdivisionCountryCode(const PrefService* local_state);

}  // namespace brave_l10n

#endif  // BRAVE_COMPONENTS_L10N_COMMON_SUBDIVISION_SUBDIVISION_UTIL_H_
