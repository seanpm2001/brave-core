/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_shields/browser/ad_block_filters_provider_manager.h"

#include <memory>
#include <string>
#include <utility>

#include "base/barrier_callback.h"
#include "base/barrier_closure.h"
#include "base/location.h"
#include "base/logging.h"
#include "base/no_destructor.h"
#include "base/notreached.h"
#include "base/task/sequenced_task_runner.h"

namespace brave_shields {

namespace {

static void OnDATLoaded(
    base::OnceCallback<void(DATFileDataBuffer)> collect_and_merge,
    const DATFileDataBuffer& dat_buf) {
  std::move(collect_and_merge).Run(dat_buf);
}

}  // namespace

// static
AdBlockFiltersProviderManager* AdBlockFiltersProviderManager::GetInstance() {
  static base::NoDestructor<AdBlockFiltersProviderManager> instance;
  return instance.get();
}

AdBlockFiltersProviderManager::AdBlockFiltersProviderManager() = default;

AdBlockFiltersProviderManager::~AdBlockFiltersProviderManager() = default;

void AdBlockFiltersProviderManager::AddProvider(
    AdBlockFiltersProvider* provider,
    bool is_for_default_engine) {
  auto rv = is_for_default_engine
                ? default_engine_filters_providers_.insert(provider)
                : additional_engine_filters_providers_.insert(provider);
  DCHECK(rv.second);
  provider->AddObserver(this);
}

void AdBlockFiltersProviderManager::RemoveProvider(
    AdBlockFiltersProvider* provider,
    bool is_for_default_engine) {
  auto& filters_providers = is_for_default_engine
                                ? default_engine_filters_providers_
                                : additional_engine_filters_providers_;
  auto it = filters_providers.find(provider);
  DCHECK(it != filters_providers.end());
  filters_providers.erase(it);
  NotifyObservers();
}

std::string AdBlockFiltersProviderManager::GetNameForDebugging() {
  return "AdBlockFiltersProviderManager";
}

void AdBlockFiltersProviderManager::OnChanged() {
  NotifyObservers();
}

// Use LoadDATBufferForEngine instead, for Filter Provider Manager.
void AdBlockFiltersProviderManager::LoadDATBuffer(
    base::OnceCallback<void(const DATFileDataBuffer& dat_buf)> cb) {
  NOTREACHED();
}

// Use LoadDATBufferForEngine instead, for Filter Provider Manager.
void AdBlockFiltersProviderManager::LoadFilterSet(
    std::shared_ptr<rust::Box<adblock::FilterSet>> filter_set,
    base::OnceCallback<void()>) {
  NOTREACHED();
}

void AdBlockFiltersProviderManager::LoadDATBufferForEngine(
    bool is_for_default_engine,
    base::OnceCallback<void(const DATFileDataBuffer& dat_buf)> cb) {
  auto& filters_providers = is_for_default_engine
                                ? default_engine_filters_providers_
                                : additional_engine_filters_providers_;
  const auto collect_and_merge = base::BarrierCallback<DATFileDataBuffer>(
      filters_providers.size(),
      base::BindOnce(&AdBlockFiltersProviderManager::FinishCombinating,
                     weak_factory_.GetWeakPtr(), std::move(cb)));
  for (auto* const provider : filters_providers) {
    task_tracker_.PostTask(
        base::SequencedTaskRunner::GetCurrentDefault().get(), FROM_HERE,
        base::BindOnce(
            &AdBlockFiltersProvider::LoadDATBuffer, provider->AsWeakPtr(),
            base::BindOnce(OnDATLoaded, std::move(collect_and_merge))));
  }
}

void AdBlockFiltersProviderManager::LoadFilterSetForEngine(
    bool is_for_default_engine,
    std::shared_ptr<rust::Box<adblock::FilterSet>> filter_set,
    base::OnceCallback<void()> cb) {
  auto& filters_providers = is_for_default_engine
                                ? default_engine_filters_providers_
                                : additional_engine_filters_providers_;
  const auto collect_and_merge = base::BarrierClosure(
      filters_providers.size(), base::BindOnce(std::move(cb)));
  for (auto* const provider : filters_providers) {
    task_tracker_.PostTask(
        base::SequencedTaskRunner::GetCurrentDefault().get(), FROM_HERE,
        base::BindOnce(&AdBlockFiltersProvider::LoadFilterSet,
                       provider->AsWeakPtr(), filter_set,
                       std::move(collect_and_merge)));
  }
}

void AdBlockFiltersProviderManager::FinishCombinating(
    base::OnceCallback<void(const DATFileDataBuffer&)> cb,
    const std::vector<DATFileDataBuffer>& results) {
  DATFileDataBuffer combined_list;
  for (const auto& dat_buf : results) {
    combined_list.push_back('\n');
    combined_list.insert(combined_list.end(), dat_buf.begin(), dat_buf.end());
  }
  std::move(cb).Run(combined_list);
}

}  // namespace brave_shields
