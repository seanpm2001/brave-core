/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_TARGETING_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_TARGETING_H_
#define BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_TARGETING_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_TARGETING_H_

#include <memory>
#include <string>

#include "brave/components/brave_ads/core/public/client/ads_client_notifier_observer.h"
#include "third_party/abseil-cpp/absl/types/optional.h"

namespace brave_ads {

class SubdivisionTargeting final : public AdsClientNotifierObserver {
 public:
  SubdivisionTargeting();

  SubdivisionTargeting(const SubdivisionTargeting&) = delete;
  SubdivisionTargeting& operator=(const SubdivisionTargeting&) = delete;

  SubdivisionTargeting(SubdivisionTargeting&&) noexcept = delete;
  SubdivisionTargeting& operator=(SubdivisionTargeting&&) noexcept = delete;

  ~SubdivisionTargeting() override;

  bool IsDisabled() const;

  bool ShouldAutoDetect() const;

  static bool ShouldAllow();

  const std::string& GetSubdivision() const;

 private:
  void Initialize();

  void MaybeRequireSubdivision();

  void DisableSubdivision();

  void AutoDetectSubdivision();

  void MaybeAllowForCountry(const std::string& country_code);

  bool ShouldFetchSubdivision();
  void MaybeFetchSubdivision();

  void MaybeAllowAndFetchSubdivisionForLocale(const std::string& locale);

  void UpdateAutoDetectedSubdivision();
  const std::string& GetLazyAutoDetectedSubdivision() const;

  void SetUserSelectedSubdivision(const std::string& subdivision);
  void UpdateUserSelectedSubdivision();
  const std::string& GetLazyUserSelectedSubdivision() const;

  void OnDidUpdateAutoDetectedSubdivision();

  // AdsClientNotifierObserver:
  void OnNotifyDidInitializeAds() override;
  void OnNotifyPrefDidChange(const std::string& path) override;

  mutable absl::optional<std::string> auto_detected_subdivision_;
  mutable absl::optional<std::string> user_selected_subdivision_;
};

}  // namespace brave_ads

#endif  // BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_TARGETING_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_TARGETING_H_
