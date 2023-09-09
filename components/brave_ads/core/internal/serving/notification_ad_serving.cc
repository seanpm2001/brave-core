/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/serving/notification_ad_serving.h"

#include "base/functional/bind.h"
#include "base/rand_util.h"
#include "base/time/time.h"
#include "brave/components/brave_ads/core/internal/client/ads_client_helper.h"
#include "brave/components/brave_ads/core/internal/common/logging_util.h"
#include "brave/components/brave_ads/core/internal/common/time/time_formatting_util.h"
#include "brave/components/brave_ads/core/internal/creatives/notification_ads/creative_notification_ad_info.h"
#include "brave/components/brave_ads/core/internal/creatives/notification_ads/notification_ad_builder.h"
#include "brave/components/brave_ads/core/internal/serving/eligible_ads/pipelines/notification_ads/eligible_notification_ads_base.h"
#include "brave/components/brave_ads/core/internal/serving/eligible_ads/pipelines/notification_ads/eligible_notification_ads_factory.h"
#include "brave/components/brave_ads/core/internal/serving/notification_ad_serving_feature.h"
#include "brave/components/brave_ads/core/internal/serving/notification_ad_serving_util.h"
#include "brave/components/brave_ads/core/internal/serving/permission_rules/notification_ads/notification_ad_permission_rules.h"
#include "brave/components/brave_ads/core/internal/serving/targeting/top_segments_util.h"
#include "brave/components/brave_ads/core/internal/serving/targeting/user_model_builder.h"
#include "brave/components/brave_ads/core/internal/serving/targeting/user_model_info.h"
#include "brave/components/brave_ads/core/internal/settings/settings.h"
#include "brave/components/brave_ads/core/internal/targeting/behavioral/anti_targeting/resource/anti_targeting_resource.h"
#include "brave/components/brave_ads/core/internal/targeting/geographical/subdivision/subdivision_targeting.h"
#include "brave/components/brave_ads/core/public/prefs/pref_names.h"
#include "brave/components/brave_ads/core/public/units/notification_ad/notification_ad_info.h"

namespace brave_ads {

namespace {
constexpr base::TimeDelta kRetryServingAdAfter = base::Minutes(2);
}  // namespace

NotificationAdServing::NotificationAdServing(
    const SubdivisionTargeting& subdivision_targeting,
    const AntiTargetingResource& anti_targeting_resource) {
  eligible_ads_ = EligibleNotificationAdsFactory::Build(
      kNotificationAdServingVersion.Get(), subdivision_targeting,
      anti_targeting_resource);

  AdsClientHelper::AddObserver(this);
}

NotificationAdServing::~NotificationAdServing() {
  AdsClientHelper::RemoveObserver(this);
  delegate_ = nullptr;
}

void NotificationAdServing::StartServingAdsAtRegularIntervals() {
  if (timer_.IsRunning()) {
    return;
  }

  BLOG(1, "Start serving notification ads at regular intervals");

  const base::TimeDelta delay = CalculateDelayBeforeServingAnAd();
  const base::Time serve_ad_at = MaybeServeAdAfter(delay);
  BLOG(1, "Maybe serve notification ad " << FriendlyDateAndTime(serve_ad_at));
}

void NotificationAdServing::StopServingAdsAtRegularIntervals() {
  if (!timer_.IsRunning()) {
    return;
  }

  BLOG(1, "Stop serving notification ads at regular intervals");

  timer_.Stop();
}

void NotificationAdServing::MaybeServeAd() {
  if (is_serving_) {
    return BLOG(1, "Already serving notification ad");
  }

  is_serving_ = true;

  if (!IsNotificationAdServingFeatureEnabled()) {
    BLOG(1, "Notification ad not served: Feature is disabled");
    return FailedToServeAd();
  }

  if (!IsSupported()) {
    BLOG(1, "Notification ad not served: Unsupported version");
    return FailedToServeAd();
  }

  if (!NotificationAdPermissionRules::HasPermission()) {
    return FailedToServeAd();
  }

  BuildUserModel(base::BindOnce(&NotificationAdServing::BuildUserModelCallback,
                                weak_factory_.GetWeakPtr()));
}

///////////////////////////////////////////////////////////////////////////////

void NotificationAdServing::BuildUserModelCallback(
    const UserModelInfo& user_model) {
  NotifyOpportunityAroseToServeNotificationAd(
      GetTopSegments(user_model, /*max_count*/ 1, /*parent_only*/ false));

  CHECK(eligible_ads_);
  eligible_ads_->GetForUserModel(
      user_model,
      base::BindOnce(&NotificationAdServing::GetForUserModelCallback,
                     weak_factory_.GetWeakPtr()));
}

void NotificationAdServing::GetForUserModelCallback(
    const CreativeNotificationAdList& creative_ads) {
  if (creative_ads.empty()) {
    BLOG(1, "Notification ad not served: No eligible ads found");
    return FailedToServeAd();
  }

  BLOG(1, "Found " << creative_ads.size() << " eligible ads");

  const int rand = base::RandInt(0, static_cast<int>(creative_ads.size()) - 1);
  const CreativeNotificationAdInfo& creative_ad = creative_ads.at(rand);

  const NotificationAdInfo ad = BuildNotificationAd(creative_ad);
  ServeAd(ad);
}

void NotificationAdServing::UpdateMaximumAdsPerHour() {
  BLOG(1, "Maximum notification ads per hour changed to "
              << GetMaximumNotificationAdsPerHour());

  MaybeServeAdAtNextRegularInterval();
}

void NotificationAdServing::MaybeServeAdAtNextRegularInterval() {
  if (!ShouldServeAdsAtRegularIntervals()) {
    return;
  }

  const base::TimeDelta delay =
      base::Hours(1) / GetMaximumNotificationAdsPerHour();
  const base::Time serve_ad_at = MaybeServeAdAfter(delay);
  BLOG(1, "Maybe serve notification ad " << FriendlyDateAndTime(serve_ad_at));
}

void NotificationAdServing::RetryServingAdAtNextInterval() {
  if (!ShouldServeAdsAtRegularIntervals()) {
    return;
  }

  const base::Time serve_ad_at = MaybeServeAdAfter(kRetryServingAdAfter);
  BLOG(1, "Maybe serve notification ad " << FriendlyDateAndTime(serve_ad_at));
}

base::Time NotificationAdServing::MaybeServeAdAfter(
    const base::TimeDelta delay) {
  SetServeAdAt(base::Time::Now() + delay);

  return timer_.Start(FROM_HERE, delay,
                      base::BindOnce(&NotificationAdServing::MaybeServeAd,
                                     base::Unretained(this)));
}

void NotificationAdServing::ServeAd(const NotificationAdInfo& ad) {
  if (!ad.IsValid()) {
    BLOG(1, "Failed to serve notification ad");
    return FailedToServeAd();
  }

  is_serving_ = false;

  CHECK(eligible_ads_);
  eligible_ads_->SetLastServedAd(ad);

  NotifyDidServeNotificationAd(ad);
}

void NotificationAdServing::FailedToServeAd() {
  is_serving_ = false;

  NotifyFailedToServeNotificationAd();

  RetryServingAdAtNextInterval();
}

void NotificationAdServing::NotifyOpportunityAroseToServeNotificationAd(
    const SegmentList& segments) const {
  if (delegate_) {
    delegate_->OnOpportunityAroseToServeNotificationAd(segments);
  }
}

void NotificationAdServing::NotifyDidServeNotificationAd(
    const NotificationAdInfo& ad) const {
  if (delegate_) {
    delegate_->OnDidServeNotificationAd(ad);
  }
}

void NotificationAdServing::NotifyFailedToServeNotificationAd() const {
  if (delegate_) {
    delegate_->OnFailedToServeNotificationAd();
  }
}

void NotificationAdServing::OnNotifyPrefDidChange(const std::string& path) {
  if (path == prefs::kMaximumNotificationAdsPerHour) {
    UpdateMaximumAdsPerHour();
  }
}

}  // namespace brave_ads
