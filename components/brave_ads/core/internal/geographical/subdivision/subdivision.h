/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_H_
#define BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_H_

#include <memory>
#include <string>

#include "base/observer_list.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision_observer.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision_url_request_delegate.h"
#include "brave/components/brave_ads/core/public/client/ads_client_notifier_observer.h"
#include "third_party/abseil-cpp/absl/types/optional.h"

namespace brave_ads {

class SubdivisionUrlRequest;

class Subdivision final : public AdsClientNotifierObserver,
                          public SubdivisionUrlRequestDelegate {
 public:
  Subdivision();

  Subdivision(const Subdivision&) = delete;
  Subdivision& operator=(const Subdivision&) = delete;

  Subdivision(Subdivision&&) noexcept = delete;
  Subdivision& operator=(Subdivision&&) noexcept = delete;

  ~Subdivision() override;

  void AddObserver(SubdivisionObserver* observer);
  void RemoveObserver(SubdivisionObserver* observer);

  absl::optional<std::string> GetSubdivision() const;

 private:
  void Initialize();

  void MaybeRequireSubdivision();
  void InitializeSubdivisionUrlRequest();
  void ShutdownSubdivisionUrlRequest();

  void MaybeFetchSubdivision();

  // AdsClientNotifierObserver:
  void OnNotifyDidInitializeAds() override;
  void OnNotifyPrefDidChange(const std::string& path) override;

  // SubdivisionUrlRequestDelegate:
  void OnDidFetchSubdivision(const std::string& subdivision) override;

  base::ObserverList<SubdivisionObserver> observers_;

  std::unique_ptr<SubdivisionUrlRequest> subdivision_url_request_;

  mutable absl::optional<std::string> subdivision_;
};

}  // namespace brave_ads

#endif  // BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_H_
