/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision.h"

#include "brave/components/brave_ads/core/internal/client/ads_client_helper.h"
#include "brave/components/brave_ads/core/internal/common/logging_util.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision_url_request.h"
#include "brave/components/brave_ads/core/internal/settings/settings.h"
#include "brave/components/brave_ads/core/public/prefs/pref_names.h"
#include "brave/components/brave_news/common/pref_names.h"
#include "brave/components/brave_rewards/common/pref_names.h"
#include "brave/components/l10n/common/prefs.h"
#include "brave/components/l10n/common/subdivision/subdivision_util.h"
#include "third_party/abseil-cpp/absl/types/optional.h"

namespace brave_ads {

namespace {

bool DoesRequireResource() {
  return UserHasOptedInToBraveNewsAds() || UserHasOptedInToNotificationAds();
}

}  // namespace

Subdivision::Subdivision() {
  AdsClientHelper::AddObserver(this);
}

Subdivision::~Subdivision() {
  AdsClientHelper::RemoveObserver(this);
}

absl::optional<std::string> Subdivision::GetSubdivision() const {
  return subdivision_;
}

///////////////////////////////////////////////////////////////////////////////

void Subdivision::Initialize() {
  MaybeRequireSubdivision();

  MaybeFetchSubdivision();
}

void Subdivision::MaybeRequireSubdivision() {
  DoesRequireResource() ? InitializeSubdivisionUrlRequest()
                        : ShutdownSubdivisionUrlRequest();
}

void Subdivision::InitializeSubdivisionUrlRequest() {
  if (!subdivision_url_request_) {
    BLOG(1, "Initialize subdivision URL request");
    subdivision_url_request_ = std::make_unique<SubdivisionUrlRequest>();
    subdivision_url_request_->SetDelegate(this);
  }
}

void Subdivision::ShutdownSubdivisionUrlRequest() {
  if (subdivision_url_request_) {
    subdivision_url_request_.reset();
    BLOG(1, "Shutdown subdivision URL request");
  }
}

void Subdivision::MaybeFetchSubdivision() {
  if (subdivision_url_request_) {
    subdivision_url_request_->PeriodicallyFetch();
  }
}

void Subdivision::OnNotifyDidInitializeAds() {
  Initialize();
}

void Subdivision::OnNotifyPrefDidChange(const std::string& path) {
  if (path == brave_rewards::prefs::kEnabled ||
      path == prefs ::kOptedInToNotificationAds ||
      path == brave_news::prefs::kBraveNewsOptedIn ||
      path == brave_news::prefs::kNewTabPageShowToday) {
    Initialize();
  }
}

void Subdivision::OnDidFetchSubdivision(const std::string& subdivision) {
  CHECK(!subdivision.empty());
  absl::optional<std::string> region =
      brave_l10n::GetSubdivisionCountryCode(subdivision);
  absl::optional<std::string> subdivision_code =
      brave_l10n::GetSubdivisionCode(subdivision);

  if (!region || !subdivision_code) {
    return;
  }

  if (subdivision_ == subdivision) {
    return;
  }

  subdivision_ = subdivision;

  AdsClientHelper::GetInstance()->SetLocalStatePref(
      brave_l10n::prefs::kGeoSubdivision, base::Value(subdivision));
}

}  // namespace brave_ads
