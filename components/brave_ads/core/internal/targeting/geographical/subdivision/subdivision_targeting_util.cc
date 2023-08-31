/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/targeting/geographical/subdivision/subdivision_targeting_util.h"

#include "base/containers/contains.h"
#include "brave/components/brave_ads/core/internal/client/ads_client_helper.h"
#include "brave/components/brave_ads/core/public/targeting/geographical/subdivision/supported_subdivisions.h"
#include "brave/components/l10n/common/prefs.h"
#include "third_party/abseil-cpp/absl/types/optional.h"

namespace brave_ads {

bool ShouldTargetSubdivisionCountryCode(const std::string& country_code) {
  return base::Contains(GetSupportedSubdivisions(), country_code);
}

bool ShouldTargetSubdivision(const std::string& country_code,
                             const std::string& subdivision) {
  const auto iter = GetSupportedSubdivisions().find(country_code);
  if (iter == GetSupportedSubdivisions().cend()) {
    return false;
  }

  const auto& [_, subdivisions] = *iter;

  return base::Contains(subdivisions, subdivision);
}

std::string GetLocalStateGeoSubdivision() {
  const absl::optional<base::Value> value =
      AdsClientHelper::GetInstance()->GetLocalStatePref(
          brave_l10n::prefs::kGeoSubdivision);
  if (!value) {
    return {};
  }

  const std::string* geo_subdivision = value->GetIfString();
  return geo_subdivision ? *geo_subdivision : std::string();
}

}  // namespace brave_ads
