/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/account/confirmations/user_data_builder/fixed/confirmation_fixed_user_data_builder.h"

#include <utility>

#include "base/functional/bind.h"
#include "base/functional/callback.h"
#include "base/values.h"
#include "brave/components/brave_ads/core/internal/account/user_data/build_user_data_callback.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/build_channel_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/catalog_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/conversion_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/created_at_timestamp_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/locale_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/platform_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/rotating_hash_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/segment_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/studies_user_data.h"
#include "brave/components/brave_ads/core/internal/account/user_data/fixed/version_number_user_data.h"
#include "brave/components/brave_ads/core/internal/serving/targeting/user_model_builder.h"
#include "brave/components/brave_ads/core/public/account/confirmations/confirmation_type.h"

namespace brave_ads {

namespace {

void BuildFixedUserDataCallback(const TransactionInfo& transaction,
                                BuildUserDataCallback callback,
                                base::Value::Dict user_data) {
  user_data.Merge(BuildBuildChannelUserData());
  user_data.Merge(BuildCatalogUserData());
  user_data.Merge(BuildCreatedAtTimestampUserData(transaction));
  user_data.Merge(BuildLocaleUserData());
  user_data.Merge(BuildPlatformUserData());
  user_data.Merge(BuildRotatingHashUserData(transaction));
  user_data.Merge(BuildSegmentUserData(transaction));
  user_data.Merge(BuildStudiesUserData());
  user_data.Merge(BuildVersionNumberUserData());

  std::move(callback).Run(std::move(user_data));
}

}  // namespace

void BuildFixedUserData(const TransactionInfo& transaction,
                        BuildUserDataCallback callback) {
  // TODO(tmancey): Build "top_segment" user data by calling |BuildUserModel|
  // and discuss sending both "segment" and "top_segment" with privacy.

  if (transaction.confirmation_type != ConfirmationType::kConversion) {
    return BuildFixedUserDataCallback(transaction, std::move(callback),
                                      /*conversion_user_data*/ {});
  }

  BuildConversionUserData(transaction.creative_instance_id,
                          base::BindOnce(&BuildFixedUserDataCallback,
                                         transaction, std::move(callback)));
}

}  // namespace brave_ads
