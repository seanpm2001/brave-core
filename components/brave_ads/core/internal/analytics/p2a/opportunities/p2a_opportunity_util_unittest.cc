/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/analytics/p2a/opportunities/p2a_opportunity_util.h"

#include "brave/components/brave_ads/core/public/units/ad_type.h"
#include "testing/gtest/include/gtest/gtest.h"

// npm run test -- brave_unit_tests --filter=BraveAds*

namespace brave_ads {

TEST(BraveAdsP2AOpportunityUtilTest, BuildP2AAdOpportunityEvents) {
  // Arrange

  // Act

  // Assert
  const std::vector<std::string> expected_events = {
      "Brave.P2A.AdOpportunity.technologycomputing.ad_notification",
      "Brave.P2A.AdOpportunity.personalfinancecrypto.ad_notification",
      "Brave.P2A.AdOpportunity.travel.ad_notification",
      "Brave.P2A.TotalAdOpportunities.ad_notification"};

  EXPECT_EQ(expected_events, BuildP2AAdOpportunityEvents(
                                 AdType::kNotificationAd, /*segments*/ {
                                     "technology & computing",
                                     "personal finance-crypto", "travel"}));
}

TEST(BraveAdsP2AOpportunityUtilTest, BuildAdOpportunityEventsForEmptySegments) {
  // Arrange

  // Act

  // Assert
  const std::vector<std::string> expected_events = {
      "Brave.P2A.TotalAdOpportunities.ad_notification"};

  EXPECT_EQ(expected_events, BuildP2AAdOpportunityEvents(
                                 AdType::kNotificationAd, /*segments*/ {}));
}

}  // namespace brave_ads
