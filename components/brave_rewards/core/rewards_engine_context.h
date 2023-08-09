/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_REWARDS_ENGINE_CONTEXT_H_
#define BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_REWARDS_ENGINE_CONTEXT_H_

#include <memory>
#include <tuple>
#include <utility>

#include "base/memory/raw_ref.h"

namespace brave_rewards::internal {

class RewardsEngineImpl;
class InitializationManager;

class RewardsEngineContext {
 public:
  explicit RewardsEngineContext(RewardsEngineImpl& engine_impl);
  virtual ~RewardsEngineContext();

  RewardsEngineContext(const RewardsEngineContext&) = delete;
  RewardsEngineContext& operator=(const RewardsEngineContext&) = delete;

  RewardsEngineImpl& GetEngineImpl() const { return engine_impl_.get(); }

  template <typename T>
  T& GetHelper() const {
    auto& helper = std::get<std::unique_ptr<T>>(helpers_);
    CHECK(helper) << "Rewards engine helper has not been created";
    return *helper;
  }

 private:
  template <typename T, typename... Args>
  auto CreateHelper(Args&&... args) {
    return std::unique_ptr<T>(new T(*this, std::forward<Args>(args)...));
  }

  const raw_ref<RewardsEngineImpl> engine_impl_;
  std::tuple<std::unique_ptr<InitializationManager>> helpers_;
};

}  // namespace brave_rewards::internal

#endif  // BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_REWARDS_ENGINE_CONTEXT_H_
