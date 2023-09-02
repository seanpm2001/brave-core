/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_L10N_COMMON_SUBDIVISION_SUBDIVISION_FEATURE_H_
#define BRAVE_COMPONENTS_L10N_COMMON_SUBDIVISION_SUBDIVISION_FEATURE_H_

#include "base/feature_list.h"
#include "base/metrics/field_trial_params.h"

namespace brave_l10n {

BASE_DECLARE_FEATURE(kSubdivisionFeature);

constexpr base::FeatureParam<int> kSubdivisionFetchIntervalMinutes{
    &kSubdivisionFeature, "fetch_interval_minutes", 3600};

constexpr base::FeatureParam<bool> kFetchResourcesBySubdivision{
    &kSubdivisionFeature, "fetch_resources_by_subdivision", true};

}  // namespace brave_l10n

#endif  // BRAVE_COMPONENTS_L10N_COMMON_SUBDIVISION_SUBDIVISION_FEATURE_H_
