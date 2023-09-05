/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/targeting/geographical/subdivision/subdivision_targeting.h"

#include <memory>

#include "brave/components/brave_ads/core/internal/common/unittest/unittest_base.h"
#include "brave/components/brave_ads/core/internal/common/unittest/unittest_mock_util.h"
#include "brave/components/brave_ads/core/internal/common/unittest/unittest_pref_util.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision_url_request_builder_util.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision_url_request_unittest_util.h"
#include "brave/components/brave_ads/core/internal/settings/settings_unittest_util.h"
#include "brave/components/brave_ads/core/internal/targeting/geographical/subdivision/subdivision_targeting_constants.h"
#include "brave/components/brave_ads/core/public/prefs/pref_names.h"
#include "brave/components/brave_news/common/pref_names.h"
#include "brave/components/l10n/common/test/scoped_default_locale.h"
#include "net/http/http_status_code.h"

// npm run test -- brave_unit_tests --filter=BraveAds*

namespace brave_ads {

class BraveAdsSubdivisionTargetingTest : public UnitTestBase {
 protected:
  void SetUp() override {
    UnitTestBase::SetUp();

    subdivision_targeting_ = std::make_unique<SubdivisionTargeting>();
    subdivision_ = std::make_unique<Subdivision>();
    subdivision_->AddObserver(subdivision_targeting_.get());
  }

  void MockHttpOkUrlResponse(const std::string& country_code,
                             const std::string& subdivision_code) {
    const URLResponseMap url_responses = {
        {BuildSubdivisionUrlPath(),
         {{net::HTTP_OK, BuildSubdivisionUrlResponseBodyForTesting(
                             country_code, subdivision_code)}}}};
    MockUrlResponses(ads_client_mock_, url_responses);
  }

  std::unique_ptr<SubdivisionTargeting> subdivision_targeting_;
  std::unique_ptr<Subdivision> subdivision_;
};

TEST_F(BraveAdsSubdivisionTargetingTest,
       AllowAndFetchWhenOptingInToNotificationAds) {
  // Arrange
  DisableBraveNewsAdsForTesting();
  DisableNotificationAdsForTesting();

  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  // Act
  ads_client_mock_.SetBooleanPref(prefs::kOptedInToNotificationAds, true);

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       AllowAndFetchWhenOptingInToBraveNewsAds) {
  // Arrange
  DisableBraveNewsAdsForTesting();
  DisableNotificationAdsForTesting();

  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  // Act
  ads_client_mock_.SetBooleanPref(brave_news::prefs::kBraveNewsOptedIn, true);
  ads_client_mock_.SetBooleanPref(brave_news::prefs::kNewTabPageShowToday,
                                  true);

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       DoNotFetchWhenOptingOutOfNotificationAds) {
  // Arrange
  DisableBraveNewsAdsForTesting();

  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  NotifyDidInitializeAds();

  // Assert
  EXPECT_CALL(ads_client_mock_, UrlRequest).Times(0);

  // Act
  ads_client_mock_.SetBooleanPref(prefs::kOptedInToNotificationAds, false);
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       DoNotFetchWhenOptingOutOfBraveNewsAds) {
  // Arrange
  DisableNotificationAdsForTesting();

  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  NotifyDidInitializeAds();

  // Assert
  EXPECT_CALL(ads_client_mock_, UrlRequest).Times(0);

  // Act
  ads_client_mock_.SetBooleanPref(brave_news::prefs::kBraveNewsOptedIn, false);
  ads_client_mock_.SetBooleanPref(brave_news::prefs::kNewTabPageShowToday,
                                  false);
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowAndAutoDetectForSupportedCountryAndRegionUrlResponse) {
  // Arrange
  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(
    BraveAdsSubdivisionTargetingTest,
    ShouldAllowButDefaultToDisabledForSupportedCountryButNoRegionUrlResponse) {
  // Arrange
  MockHttpOkUrlResponse(/*country_code*/ "US",
                        /*subdivision_code*/ "NO REGION");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_TRUE(subdivision_targeting_->IsDisabled());
  EXPECT_FALSE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAutoDetectForUnsupportedCountryAndRegionUrlResponse) {
  // Arrange
  MockHttpOkUrlResponse(/*country_code*/ "XX", /*subdivision_code*/ "XX");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_FALSE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowIfDisabledAndCountryIsSupported) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingSubdivision,
                kSubdivisionTargetingDisabled);
  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_TRUE(subdivision_targeting_->IsDisabled());
  EXPECT_FALSE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowIfDisabledAndCountryIsUnsupported) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingSubdivision,
                kSubdivisionTargetingDisabled);
  MockHttpOkUrlResponse(/*country_code*/ "XX", /*subdivision_code*/ "XX");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_FALSE(SubdivisionTargeting::ShouldAllow());
  EXPECT_TRUE(subdivision_targeting_->IsDisabled());
  EXPECT_FALSE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowAndAutoDetectIfCountryIsSupported) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingAutoDetectedSubdivision, "US-CA");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowAndAutoDetectIfSubdivisionCodeIsUnsupported) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingAutoDetectedSubdivision, "XX-XX");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_FALSE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("XX-XX", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldNotAllowIfLocaleIsUnsupportedAndSubdivisionCodeIsEmpty) {
  // Arrange
  const brave_l10n::test::ScopedDefaultLocale scoped_default_locale{"xx_XX"};

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_FALSE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest, ShouldAllowIfSubdivisionCodeNotValid) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingAutoDetectedSubdivision,
                "CA-NO REGION");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_TRUE(subdivision_targeting_->IsDisabled());
  EXPECT_FALSE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAutoDetectAndNotAllowIfSubdivisionCodeIsEmpty) {
  // Arrange

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_FALSE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       RetryAfterInvalidUrlResponseStatusCode) {
  // Arrange
  const URLResponseMap url_responses = {
      {BuildSubdivisionUrlPath(),
       {{net::HTTP_INTERNAL_SERVER_ERROR,
         /*response_body*/ net::GetHttpReasonPhrase(
             net::HTTP_INTERNAL_SERVER_ERROR)},
        {net::HTTP_OK,
         BuildSubdivisionUrlResponseBodyForTesting(
             /*country_code*/ "US", /*subdivision_code*/ "CA")}}}};
  MockUrlResponses(ads_client_mock_, url_responses);

  NotifyDidInitializeAds();

  // Act
  FastForwardClockToNextPendingTask();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowWhenUserSelectSubdivisionWithSameCountry) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingSubdivision, "US-FL");
  MockHttpOkUrlResponse(/*country_code*/ "US", /*subdivision_code*/ "CA");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_FALSE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
  EXPECT_EQ("US-FL", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingSubdivision));
  EXPECT_EQ("US-FL", subdivision_targeting_->GetSubdivision());
}

TEST_F(BraveAdsSubdivisionTargetingTest,
       ShouldAllowWhenUserSelectSubdivisionAndAutodetectedCountryIsSupported) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingSubdivision, "US-FL");
  MockHttpOkUrlResponse(/*country_code*/ "CA", /*subdivision_code*/ "AL");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_TRUE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("CA-AL", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

TEST_F(
    BraveAdsSubdivisionTargetingTest,
    ShouldNotAllowWhenUserSelectSubdivisionAndAutodetectedCountryIsUnsupported) {
  // Arrange
  SetStringPref(prefs::kSubdivisionTargetingSubdivision, "US-FL");
  MockHttpOkUrlResponse(/*country_code*/ "XX", /*subdivision_code*/ "XX");

  // Act
  NotifyDidInitializeAds();

  // Assert
  EXPECT_FALSE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_FALSE(subdivision_targeting_->ShouldAutoDetect());
  EXPECT_EQ("XX-XX", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
  EXPECT_EQ("US-FL", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingSubdivision));
  EXPECT_EQ("US-FL", subdivision_targeting_->GetSubdivision());
}

class BraveAdsSubdivisionTargetingRetryOnInvalidUrlResponseBodyTest
    : public BraveAdsSubdivisionTargetingTest,
      public ::testing::WithParamInterface<const char*> {};

TEST_P(BraveAdsSubdivisionTargetingRetryOnInvalidUrlResponseBodyTest,
       RetryAfterInvalidUrlResponseBody) {
  // Arrange
  const URLResponseMap url_responses = {
      {BuildSubdivisionUrlPath(),
       {{net::HTTP_OK, /*response_body*/ GetParam()},
        {net::HTTP_OK,
         BuildSubdivisionUrlResponseBodyForTesting(
             /*country_code*/ "US", /*subdivision_code*/ "CA")}}}};
  MockUrlResponses(ads_client_mock_, url_responses);

  NotifyDidInitializeAds();

  // Act
  FastForwardClockToNextPendingTask();

  // Assert
  EXPECT_TRUE(SubdivisionTargeting::ShouldAllow());
  EXPECT_FALSE(subdivision_targeting_->IsDisabled());
  EXPECT_EQ("US-CA", ads_client_mock_.GetStringPref(
                         prefs::kSubdivisionTargetingAutoDetectedSubdivision));
}

INSTANTIATE_TEST_SUITE_P(
    ,
    BraveAdsSubdivisionTargetingRetryOnInvalidUrlResponseBodyTest,
    ::testing::Values("",
                      "INVALID",
                      "{}",
                      "{INVALID}",
                      R"({"country":"US","region":""})",
                      R"({"country":"","region":"CA"})",
                      R"({"country":"","region":""})",
                      R"({"country":"US"})",
                      R"({"region":"CA"})"));

}  // namespace brave_ads
