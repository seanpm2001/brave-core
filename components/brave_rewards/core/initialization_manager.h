/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_INITIALIZATION_MANAGER_H_
#define BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_INITIALIZATION_MANAGER_H_

#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "brave/components/brave_rewards/core/rewards_engine_helper.h"

namespace brave_rewards::internal {

class InitializationManager : public RewardsEngineHelper {
 public:
  enum class State { kUninitialized, kInitializing, kReady, kShuttingDown };

  ~InitializationManager() override;

  using InitializeCallback = base::OnceCallback<void(bool)>;
  void Initialize(InitializeCallback callback);

  using ShutdownCallback = base::OnceCallback<void(bool)>;
  void Shutdown(ShutdownCallback callback);

  State state() const { return state_; }

  bool IsReady() const { return state_ == State::kReady; }
  bool IsShuttingDown() const { return state_ == State::kShuttingDown; }

 private:
  friend class RewardsEngineContext;

  explicit InitializationManager(RewardsEngineContext& context);

  void OnDatabaseInitialized(InitializeCallback callback, mojom::Result result);
  void OnStateInitialized(InitializeCallback callback, mojom::Result result);
  void InitializeHelpers();
  void OnContributionsFinished(ShutdownCallback callback, mojom::Result result);
  void OnDatabaseClosed(ShutdownCallback callback, mojom::Result result);

  State state_ = State::kUninitialized;
  base::WeakPtrFactory<InitializationManager> weak_factory_{this};
};

}  // namespace brave_rewards::internal

#endif  // BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_INITIALIZATION_MANAGER_H_
