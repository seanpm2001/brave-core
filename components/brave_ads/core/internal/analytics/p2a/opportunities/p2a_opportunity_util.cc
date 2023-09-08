/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/analytics/p2a/opportunities/p2a_opportunity_util.h"

#include <sstream>

#include "base/strings/strcat.h"
#include "base/strings/string_util.h"
#include "brave/components/brave_ads/core/internal/common/strings/string_strip_util.h"
#include "brave/components/brave_ads/core/public/units/ad_type.h"
#include "third_party/abseil-cpp/absl/types/optional.h"

namespace brave_ads {

namespace {

constexpr char kPerSegmentEventPrefix[] = "Brave.P2A.AdOpportunitiesPerSegment";
constexpr char kTotalEventPrefix[] = "Brave.P2A.TotalAdOpportunities";

std::string NormalizeSegment(const std::string& segment) {
  std::string normalized_segment;
  base::ReplaceChars(StripNonAlphaNumericCharacters(segment), " ", "",
                     &normalized_segment);

  return normalized_segment;
}

absl::optional<std::string> BuildP2AAdOpportunitiesPerSegmentEvent(
    const AdType& ad_type,
    const std::string& segment) {
  const std::string normalized_segment = NormalizeSegment(segment);
  if (segment.empty()) {
    return absl::nullopt;
  }

  std::stringstream ss;
  ss << ad_type;

  return base::StrCat(
      {kPerSegmentEventPrefix, ".", normalized_segment, ".", ss.str()});
}

std::string BuildTotalAdOpportunitiesEvent(const AdType& ad_type) {
  std::stringstream ss;
  ss << ad_type;

  return base::StrCat({kTotalEventPrefix, ".", ss.str()});
}

}  // namespace

// TODO(tmancey): Discuss recording opportunities for each ad unit.
std::vector<std::string> BuildP2AAdOpportunityEvents(
    const AdType& ad_type,
    const SegmentList& segments) {
  std::vector<std::string> events;

  for (const auto& segment : segments) {
    if (const absl::optional<std::string> per_segment_event =
            BuildP2AAdOpportunitiesPerSegmentEvent(ad_type, segment)) {
      events.push_back(*per_segment_event);
    }
  }

  const std::string total_event = BuildTotalAdOpportunitiesEvent(ad_type);
  events.emplace_back(total_event);

  return events;
}

}  // namespace brave_ads
