/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_rewards/core/initialization_manager.h"

#include <utility>

#include "brave/components/brave_rewards/core/common/legacy_callback_helpers.h"
#include "brave/components/brave_rewards/core/rewards_engine_impl.h"

namespace brave_rewards::internal {

InitializationManager::InitializationManager(RewardsEngineContext& context)
    : RewardsEngineHelper(context) {}

InitializationManager::~InitializationManager() = default;

void InitializationManager::Initialize(InitializeCallback callback) {
  if (state_ != State::kUninitialized) {
    LogError(FROM_HERE) << "Initialization has already been started";
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), false));
    return;
  }

  state_ = State::kInitializing;

  GetEngineImpl().database()->Initialize(ToLegacyCallback(
      base::BindOnce(&InitializationManager::OnDatabaseInitialized,
                     weak_factory_.GetWeakPtr(), std::move(callback))));
}

void InitializationManager::Shutdown(ShutdownCallback callback) {
  if (state_ != State::kReady) {
    LogError(FROM_HERE) << "Initialization not complete";
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), false));
    return;
  }

  state_ = State::kShuttingDown;

  client().ClearAllNotifications();

  GetEngineImpl().database()->FinishAllInProgressContributions(ToLegacyCallback(
      base::BindOnce(&InitializationManager::OnContributionsFinished,
                     weak_factory_.GetWeakPtr(), std::move(callback))));
}

void InitializationManager::OnDatabaseInitialized(InitializeCallback callback,
                                                  mojom::Result result) {
  DCHECK(state_ == State::kInitializing);

  if (result != mojom::Result::OK) {
    LogError(FROM_HERE) << "Database could not be initialized";
    std::move(callback).Run(false);
    return;
  }

  GetEngineImpl().state()->Initialize(
      base::BindOnce(&InitializationManager::OnStateInitialized,
                     weak_factory_.GetWeakPtr(), std::move(callback)));
}

void InitializationManager::OnStateInitialized(InitializeCallback callback,
                                               mojom::Result result) {
  DCHECK(state_ == State::kInitializing);

  if (result != mojom::Result::OK) {
    LogError(FROM_HERE) << "Failed to initialize state";
    std::move(callback).Run(false);
    return;
  }

  InitializeHelpers();

  state_ = State::kReady;

  std::move(callback).Run(true);
}

void InitializationManager::InitializeHelpers() {
  auto& engine = GetEngineImpl();
  engine.publisher()->SetPublisherServerListTimer();
  engine.contribution()->SetAutoContributeTimer();
  engine.contribution()->SetMonthlyContributionTimer();
  engine.promotion()->Refresh(false);
  engine.contribution()->Initialize();
  engine.promotion()->Initialize();
  engine.api()->Initialize();
  engine.recovery()->Check();
}

void InitializationManager::OnContributionsFinished(ShutdownCallback callback,
                                                    mojom::Result result) {
  if (result != mojom::Result::OK) {
    LogError(FROM_HERE) << "Error finalizing contributions";
  }

  GetEngineImpl().database()->Close(
      base::BindOnce(&InitializationManager::OnDatabaseClosed,
                     weak_factory_.GetWeakPtr(), std::move(callback));
}

void InitializationManager::OnDatabaseClosed(ShutdownCallback callback,
                                             mojom::Result result) {
  if (result != mojom::Result::OK) {
    LogError(FROM_HERE) << "Error closing database";
  }

  state_ = State::kUninitialized;
  std::move(callback).Run(true);
}

}  // namespace brave_rewards::internal
