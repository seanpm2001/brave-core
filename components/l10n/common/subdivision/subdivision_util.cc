/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/l10n/common/subdivision/subdivision_util.h"

#include <vector>

#include "base/strings/string_split.h"
#include "brave/components/l10n/common/locale_util.h"
#include "brave/components/l10n/common/prefs.h"
#include "brave/components/l10n/common/subdivision/subdivision_feature.h"
#include "components/prefs/pref_service.h"

namespace brave_l10n {

namespace {

std::vector<std::string> SplitComponents(const std::string& subdivision) {
  return base::SplitString(subdivision, "-", base::TRIM_WHITESPACE,
                           base::SPLIT_WANT_NONEMPTY);
}

}  // namespace

absl::optional<std::string> GetSubdivisionCountryCode(
    const std::string& subdivision) {
  const std::vector<std::string> components = SplitComponents(subdivision);
  if (components.size() != 2) {
    return absl::nullopt;
  }

  return components.front();
}

absl::optional<std::string> GetSubdivisionCode(const std::string& subdivision) {
  const std::vector<std::string> components = SplitComponents(subdivision);
  if (components.size() != 2) {
    return absl::nullopt;
  }

  return components.back();
}

std::string GetCurrentSubdivisionCountryCode(const PrefService* local_state) {
  if (!kFetchResourcesBySubdivision.Get()) {
    return GetDefaultISOCountryCodeString();
  }

  const std::string geo_subdivision =
      local_state->GetString(prefs::kGeoSubdivision);
  absl::optional<std::string> country_code =
      GetSubdivisionCountryCode(geo_subdivision);

  if (!country_code) {
    country_code = GetDefaultISOCountryCodeString();
  }

  return *country_code;
}

}  // namespace brave_l10n
