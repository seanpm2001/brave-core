/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_URL_REQUEST_H_
#define BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_URL_REQUEST_H_

#include <string>

#include "base/check_op.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "brave/components/brave_ads/core/internal/common/timer/backoff_timer.h"
#include "brave/components/brave_ads/core/internal/common/timer/timer.h"
#include "brave/components/brave_ads/core/internal/geographical/subdivision/subdivision_url_request_delegate.h"
#include "brave/components/brave_ads/core/mojom/brave_ads.mojom-forward.h"

namespace brave_ads {

class SubdivisionUrlRequest final {
 public:
  SubdivisionUrlRequest();

  SubdivisionUrlRequest(const SubdivisionUrlRequest&) = delete;
  SubdivisionUrlRequest& operator=(const SubdivisionUrlRequest&) = delete;

  SubdivisionUrlRequest(SubdivisionUrlRequest&&) noexcept = delete;
  SubdivisionUrlRequest& operator=(SubdivisionUrlRequest&&) noexcept = delete;

  ~SubdivisionUrlRequest();

  void SetDelegate(SubdivisionUrlRequestDelegate* delegate) {
    CHECK_EQ(delegate_, nullptr);
    delegate_ = delegate;
  }

  void PeriodicallyFetch();

 private:
  void Fetch();
  void FetchCallback(const mojom::UrlResponseInfo& url_response);
  void FetchAfterDelay();

  void SuccessfullyFetchedSubdivision(const std::string& subdivision);
  void FailedToFetchSubdivision();

  void Retry();
  void RetryCallback();
  void StopRetrying();

  raw_ptr<SubdivisionUrlRequestDelegate> delegate_ = nullptr;

  bool is_periodically_fetching_ = false;

  bool is_fetching_ = false;

  Timer timer_;
  BackoffTimer retry_timer_;

  base::WeakPtrFactory<SubdivisionUrlRequest> weak_factory_{this};
};

}  // namespace brave_ads

#endif  // BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_GEOGRAPHICAL_SUBDIVISION_SUBDIVISION_URL_REQUEST_H_
